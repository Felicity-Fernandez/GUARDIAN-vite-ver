import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import tensorflow as tf
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
import numpy as np
from sklearn.metrics import classification_report, precision_score, recall_score, f1_score
from tabulate import tabulate
from torchvision import transforms  # For data augmentation
#batch size=256
#learning rate=0.00005
#dropout rate=0.38926
#train steps= 9000
#eval period=1000


# Define the labels mapping
labels_mapping = {
    0: 'identity_attack',
    1: 'insult',
    2: 'obscene',
    3: 'severe_toxicity',
    4: 'sexual_explicit',
    5: 'threat',
    6: 'toxicity',
    7: 'NaN',
    # Add more mappings as needed
}

# Define the number of classes
num_classes = len(labels_mapping)

# Define a custom PyTorch Dataset for TFRecord data
class TFRecordDataset(Dataset):
    def __init__(self, file_path):
        self.file_path = file_path

    def __len__(self):
        return 1000  # Adjust based on your dataset size

    def __getitem__(self, idx):
        dataset = tf.data.TFRecordDataset(self.file_path)
        dataset = dataset.skip(idx)
        example = next(iter(dataset))
        feature_description = {
            'text': tf.io.FixedLenFeature([], tf.string),
            'label_encoded': tf.io.FixedLenFeature([], tf.int64)
        }
        parsed_example = tf.io.parse_single_example(example, feature_description)
        text = parsed_example['text'].numpy().decode()
        label_encoded = parsed_example['label_encoded'].numpy()
        return text, label_encoded

def collate_fn(batch):
    tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")
    inputs, labels = zip(*batch)

    # Apply text augmentation
    augmented_inputs = []
    for text in inputs:
        # Implement text data augmentation here
        augmented_text = text  # Placeholder for actual data augmentation
        augmented_inputs.append(augmented_text)

    input_tensors = [tokenizer(text, return_tensors="pt", padding="max_length", truncation=True) for text in inputs]
    
    # Pad sequences to the maximum length in the batch
    max_length = max(len(input_tensor["input_ids"][0]) for input_tensor in input_tensors)
    padded_inputs = [
        torch.nn.functional.pad(
            input_tensor["input_ids"][0], 
            pad=(0, max_length - len(input_tensor["input_ids"][0])),
            value=tokenizer.pad_token_id
        ) 
        for input_tensor in input_tensors
    ]
    
    # Convert the list of tensors to a single tensor
    stacked_inputs = torch.stack(padded_inputs)

    stacked_labels = torch.tensor(labels)
    
    return stacked_inputs, stacked_labels


# Initialize LASER tokenizer and model
print("Initializing LASER tokenizer and model...")
model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M")
tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")

# Preprocessing function
def preprocess_text(text, label_encoded):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    embeddings = outputs.last_hidden_state.numpy()
    label_encoded = np.array(label_encoded)
    return embeddings, label_encoded

# Load TFRecord datasets using a custom PyTorch Dataset
print("Loading TFRecord datasets...")
train_dataset = TFRecordDataset('train_dataset.tfrecord')
val_dataset = TFRecordDataset('validation_dataset.tfrecord')

# Initialize DataLoader for batching and shuffling
print("Initializing DataLoaders...")
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, collate_fn=collate_fn)
val_loader = DataLoader(val_dataset, batch_size=32, collate_fn=collate_fn)

# Define model architecture using PyTorch
print("Defining model architecture...")
class MyModel(torch.nn.Module):
    def __init__(self):
        super(MyModel, self).__init__()
        self.fc1 = torch.nn.Linear(1024, 256)
        #self.bn1 = torch.nn.BatchNorm1d(512)  # Batch normalization layer
        #self.fc2 = torch.nn.Linear(512, 256)
        #self.bn2 = torch.nn.BatchNorm1d(256)  # Batch normalization layer
        self.dropout = nn.Dropout(p=0.5)  # Increased dropout rate
        self.fc2 = torch.nn.Linear(256, num_classes)  # Final output layer
        #self.fc3 = torch.nn.Linear(256, num_classes)  # Final output layer

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        #x = self.bn1(x)  # Apply batch normalization
        #x = torch.relu(self.fc2(x))  # Applied ReLU activation after the second layer
        #x = self.bn2(x)  # Apply batch normalization
        x = self.dropout(x)
        x = torch.softmax(self.fc2(x), dim=-1)
       # x = torch.softmax(self.fc3(x), dim=-1)
        return x

# Instantiate the model
print("Instantiating the model...")
model = MyModel()

# Define loss function and optimizer
print("Defining loss function and optimizer...")
criterion = torch.nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=0.01)

# Learning rate scheduling
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=500, gamma=0.1)  # Reduce learning rate every 1000 steps

# Define evaluation period
eval_period = 50
# Define train steps
train_steps = 500

# Initialize variables for early stopping
best_val_loss = float('inf')
patience = 3  # Number of epochs to wait for validation loss to improve
num_epochs_without_improvement = 0

# Training loop
print("Starting training loop...")
total_steps = 0
for epoch in range(10):
    model.train()
    for step, batch in enumerate(train_loader):
        if step >= train_steps:
            break  # Stop training if the specified number of steps is reached
        inputs, labels = batch
        optimizer.zero_grad()
        outputs = model(inputs.float())  # Convert inputs to float before passing to the model
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        scheduler.step()  # Step the scheduler

        # Perform evaluation at specified intervals
        # Validation loop
        print("Validating...")
        if step % eval_period == 0 or (epoch == 4 and step == min(train_steps, len(train_loader)) - 1):
            model.eval()
            with torch.no_grad():
                val_loss = 0.0
                val_correct = 0
                val_total = 0
                predictions = []
                true_labels = []
                for val_batch in val_loader:
                    val_inputs, val_labels = val_batch
                    val_outputs = model(val_inputs.float())  # Convert inputs to float before passing to the model
                    _, predicted = torch.max(val_outputs, 1)
                    predictions.extend(predicted.tolist())
                    true_labels.extend(val_labels.tolist())
                    val_loss += criterion(val_outputs, val_labels).item()
                    val_total += val_labels.size(0)
                    val_correct += (predicted == val_labels).sum().item()

            # Calculate additional evaluation metrics
            class_names = list(labels_mapping.values())
            report = classification_report(true_labels, predictions, target_names=class_names, labels=list(labels_mapping.keys()), output_dict=True, zero_division=1)

            # Calculate additional evaluation metrics
            precision = precision_score(true_labels, predictions, average='macro')
            recall = recall_score(true_labels, predictions, average='macro')
            f1 = f1_score(true_labels, predictions, average='macro')

            # Print validation loss, accuracy, and additional evaluation metrics in a table format
            table = [["Epoch", "Step", "Validation Loss", "Validation Accuracy", "Precision", "Recall", "F1-score"]]
            table.append([epoch+1, total_steps, val_loss / len(val_loader), val_correct / val_total, precision, recall, f1])
            table.append(["Additional Evaluation Metrics:", "", ""])
            for label, metrics in report.items():
                if label not in ['accuracy', 'macro avg', 'weighted avg']:
                    table.append([label, metrics['precision'], metrics['recall'], metrics['f1-score'], metrics['support']])
            print(tabulate(table, headers="firstrow", tablefmt="fancy_grid"))

            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                num_epochs_without_improvement = 0
            else:
                num_epochs_without_improvement += 1
                if num_epochs_without_improvement >= patience:
                    print("Validation loss did not improve for {} epochs. Stopping training.".format(patience))
                    break

print("Training completed.")

# Save model (if necessary)
print("Saving the model...")
torch.save(model, 'my_model3.pth')

