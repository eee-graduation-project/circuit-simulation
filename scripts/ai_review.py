import os
import requests
from github import Github
import openai

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_NAME = os.getenv("GITHUB_REPOSITORY")
PR_NUMBER = os.getenv("PR_NUMBER")

openai.api_key = OPENAI_API_KEY

# GitHub API 설정
g = Github(GITHUB_TOKEN)
repo = g.get_repo(REPO_NAME)
pull_request = repo.get_pull(int(PR_NUMBER))

# 변경된 파일 가져오기
files = pull_request.get_files()

comments = []
summary_issues = []

# AI 모델 선택
def select_ai_model():
    return "gpt-4"

def generate_review(file_name, code_content):
    model = select_ai_model()

    prompt = f"""
    You are an expert code reviewer. Your task is to provide an in-depth code review based on the following criteria:
    
    1. Pre-condition Check: Verify if the functions or methods ensure necessary pre-conditions, such as correct variable states or valid input ranges.
    2. Runtime Error Check: Identify code sections that may cause runtime errors or other potential issues.
    3. Optimization: Suggest performance improvements if there are optimization opportunities.
    4. Security Issue: Check for security vulnerabilities or the use of insecure modules and recommend fixes.
    5. Additional Suggestions: Highlight problematic sections or suggest better code snippets considering the language-specific best practices, even if no issue exists.

    At the end, provide a summary of the key issues or improvements found in the code.

    Here is the code to review from file {file_name}:

    {code_content}
    """

    # OpenAI API 호출
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an expert code reviewer."},
            {"role": "user", "content": prompt}
        ]
    )

    review = response['choices'][0]['message']['content']

    summary_start = review.rfind("Summary:")
    summary = review[summary_start:].strip() if summary_start != -1 else "No summary provided."

    return review, summary

for file in files:
    if file.filename.endswith(('.py', '.js', 'html', 'css')):
        code_content = requests.get(file.raw_url).text

        try:
            review, summary = generate_review(file.filename, code_content)
            comments.append({"path": file.filename, "body": review, "line": 1})
            summary_issues.append(summary)
        except Exception as e:
            comments.append({"path": file.filename, "body": f"AI 리뷰 생성 중 오류 발생: {str(e)}", "line": 1})

# GitHub 리뷰 코멘트 추가
if comments:
    pull_request.create_review(
        body="AI review by OpenAI.\n\n### Summary\n" + "\n".join(summary_issues),
        event="COMMENT",
        comments=comments
    )
