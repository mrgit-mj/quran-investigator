from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

tokenizer = AutoTokenizer.from_pretrained("asafaya/bert-base-arabic")
model = AutoModelForSequenceClassification.from_pretrained("asafaya/bert-base-arabic")

text = "إدخال نص عربي هنا"  # Replace with your Arabic text

inputs = tokenizer(text, return_tensors="pt")
with torch.no_grad():
    logits = model(**inputs).logits

predicted_class_id = logits.argmax().item()
print("Predicted class:", predicted_class_id)
