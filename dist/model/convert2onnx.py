import torch
from torch.autograd import Variable
import torch.onnx
import torchvision


# Define the input shape
input_shape = (32, 256)  # Example input shape: (batch_size, channels, height, width)

# Load the PyTorch model
model_path = "my_model4.pth"
mymodel = torch.load(model_path)

# Export the PyTorch model to ONNX format
dummy_input = Variable(torch.randn(32, 1024))
torch.onnx.export(mymodel, dummy_input, 'model4.onnx', verbose=True, input_names=['input'], output_names=['output'])
