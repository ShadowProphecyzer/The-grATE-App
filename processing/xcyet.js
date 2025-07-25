import os
import sys
import pathlib
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))
from huggingface_hub import InferenceClient

STAGE1_DIR = pathlib.Path(__file__).parent / 'stage_1'
STAGE2_DIR = pathlib.Path(__file__).parent / 'stage_2'
QUESTION = os.environ.get('xcyet_api_prompt', 'What is the main content?')
MODEL = os.environ.get('xcyet_model', 'deepset/roberta-base-squad2')
HF_TOKEN = os.environ.get('HF_TOKEN')

if not HF_TOKEN:
    print('HF_TOKEN not set in environment.')
    sys.exit(1)

client = InferenceClient(provider="hf-inference", api_key=HF_TOKEN)

# Find the first .txt file in stage_1
txt_files = list(STAGE1_DIR.glob('*.txt'))
if not txt_files:
    print('No text files in stage_1.')
    sys.exit(0)

file = txt_files[0]
print(f'Processing: {file}')
with open(file, 'r', encoding='utf-8') as f:
    context = f.read()

answer = client.question_answering(
    question=QUESTION,
    context=context,
    model=MODEL,
)

# Extract answer string
if isinstance(answer, list):
    answer_str = answer[0].answer
else:
    answer_str = answer.answer

# Ensure stage_2 exists
STAGE2_DIR.mkdir(exist_ok=True)
output_file = STAGE2_DIR / (file.stem + '.txt')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(str(answer_str))
print(f'Saved answer to: {output_file}')

# Delete the processed input file from stage_1
txt_files[0].unlink()
print(f'Deleted processed input file: {file}') 