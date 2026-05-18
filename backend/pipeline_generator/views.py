# ================================
# IMPORTS
# ================================

import os
import requests
import base64
import json
from dotenv import load_dotenv
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


# ================================
# GITHUB ACTIONS GENERATOR
# ================================

def generate_github_actions(
    environments,
    deployment,
    security,
    branch_strategy,
    registry,
    advanced
):

    environment_order = [
        "Development",
        "Staging",
        "Production"
    ]

    environments = sorted(
        environments,
        key=lambda x: environment_order.index(x)
        if x in environment_order else 999
    )

    branch_trigger = "main"

    if branch_strategy == "GitFlow":
        branch_trigger = "main, develop, release/*"

    elif branch_strategy == "Feature Branch":
        branch_trigger = "*"

    yaml = f"""name: Smart CI/CD Pipeline

on:
  push:
    branches: [{branch_trigger}]
  workflow_dispatch:

jobs:

  build-and-test:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout Repository
        uses: actions/checkout@v3
"""

    if advanced.get("caching"):
        yaml += """
      - name: Cache Node Modules
        uses: actions/cache@v3

        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
"""

    yaml += """
      - name: Install Dependencies
        run: npm install
"""

    yaml += """
      - name: Run Tests
        run: npm test
"""

    yaml += """
      - name: Build Application
        run: npm run build
"""

    if "SAST" in security:
        yaml += """
      - name: SAST Scan
        run: echo "Running SAST Scan..."
"""

    if "Dependency Scan" in security:
        yaml += """
      - name: Dependency Vulnerability Scan
        run: npm audit --audit-level=high
"""

    if "Secret Detection" in security:
        yaml += """
      - name: Secret Detection
        run: echo "Running Secret Detection..."
"""

    if "Docker Scan" in security:
        yaml += """
      - name: Docker Image Scan
        run: echo "Scanning Docker Image..."
"""

    yaml += f"""
      - name: Build Docker Image
        run: docker build -t myapp:latest .

  publish:

    needs: build-and-test

    runs-on: ubuntu-latest

    steps:

      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Push Image to {registry}
        run: echo "Pushing Docker image to {registry}..."
"""

    for env in environments:

        env_lower = env.lower()

        yaml += f"""

  deploy-{env_lower}:

    needs: publish

    runs-on: ubuntu-latest

    environment: {env}

    steps:

      - name: Deploy to {deployment}
"""

        if deployment == "Kubernetes":
            yaml += """
        run: kubectl apply -f deployment.yaml
"""
        elif deployment == "AWS ECS / EC2":
            yaml += """
        run: echo "Deploying to AWS ECS..."
"""
        elif deployment == "Vercel":
            yaml += """
        run: vercel deploy --prod
"""
        else:
            yaml += f"""
        run: echo "Deploying to {deployment}..."
"""

    if advanced.get("slack"):
        yaml += """

  notify:

    needs: [publish]

    runs-on: ubuntu-latest

    steps:

      - name: Slack Notification
        run: echo "Sending Slack Notification..."
"""

    return yaml


# ================================
# GITLAB CI GENERATOR
# ================================

def generate_gitlab_ci(environments, deployment, security, branch_strategy, registry, advanced):

    stages = ["build", "test"]

    if security:
        stages.append("security")

    stages.append("publish")

    for env in environments:
        stages.append(f"deploy-{env.lower()}")

    stages_str = "\n  - ".join(stages)

    yaml = f"""stages:
  - {stages_str}

default:
  image: ubuntu:latest
"""

    if advanced.get("caching"):
        yaml += """
cache:
  paths:
    - .npm/
"""

    yaml += """
build_job:
  stage: build
  script:
    - echo "Building project..."

test_job:
  stage: test
  script:
    - echo "Running tests..."
"""

    if security:
        yaml += """
security_scan:
  stage: security
  script:
"""
        if "SAST" in security:
            yaml += '    - echo "Running SAST..."\n'
        if "Dependency Scan" in security:
            yaml += '    - echo "Running Dependency Scan..."\n'
        if "Docker Scan" in security:
            yaml += '    - echo "Running Docker Scan..."\n'
        if "Secret Detection" in security:
            yaml += '    - echo "Running Secret Detection..."\n'

    yaml += f"""
publish_job:
  stage: publish
  script:
    - echo "Pushing to {registry}..."
"""

    for env in environments:
        env_lower = env.lower()
        yaml += f"""
deploy_{env_lower}:
  stage: deploy-{env_lower}
  environment:
    name: {env}
  script:
    - echo "Deploying to {deployment}..."
"""

    if advanced.get("slack"):
        yaml += """
slack_notification:
  stage: .post
  script:
    - echo "Sending Slack Notification..."
"""

    return yaml


# ================================
# JENKINS GENERATOR
# ================================

def generate_jenkins(
    environments,
    deployment,
    security,
    branch_strategy,
    registry,
    advanced
):

    environment_order = [
        "Development",
        "Staging",
        "Production"
    ]

    environments = sorted(
        environments,
        key=lambda x: environment_order.index(x)
        if x in environment_order else 999
    )

    stages = """
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }
"""

    if security:
        stages += """
        stage('Security Scans') {
            steps {
"""
        if "SAST" in security:
            stages += """
                echo 'Running SAST Scan...'
"""
        if "Dependency Scan" in security:
            stages += """
                sh 'npm audit --audit-level=high'
"""
        if "Secret Detection" in security:
            stages += """
                echo 'Running Secret Detection...'
"""
        if "Docker Scan" in security:
            stages += """
                echo 'Running Docker Scan...'
"""
        stages += """
            }
        }
"""

    stages += f"""
        stage('Publish Docker Image') {{
            steps {{
                echo 'Pushing image to {registry}...'
            }}
        }}
"""

    for env in environments:
        stages += f"""
        stage('Deploy - {env}') {{
            steps {{
"""
        if deployment == "Kubernetes":
            stages += """
                sh 'kubectl apply -f deployment.yaml'
"""
        else:
            stages += f"""
                echo 'Deploying to {deployment}...'
"""
        stages += """
            }
        }
"""

    post_section = ""

    if advanced.get("slack"):
        post_section = """
    post {
        always {
            echo 'Sending Slack Notification...'
        }
    }
"""

    pipeline = f"""pipeline {{

    agent any

    stages {{
{stages}
    }}
{post_section}
}}
"""

    return pipeline


# ================================
# AZURE DEVOPS GENERATOR
# ================================

def generate_azure_devops(environments, deployment, security, branch_strategy, registry, advanced):

    branch_trigger = "main"

    if branch_strategy == "GitFlow":
        branch_trigger = "\n    - main\n    - develop\n    - release/*"
    elif branch_strategy == "Feature Branch":
        branch_trigger = "\n    - '*'"
    else:
        branch_trigger = "\n    - main"

    yaml = f"""trigger:{branch_trigger}

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: BuildAndTest
  jobs:
  - job: Build
    steps:
    - script: echo "Building project..."
      displayName: 'Build'
    - script: echo "Running tests..."
      displayName: 'Test'
"""

    if security:
        yaml += "- stage: Security\n  jobs:\n  - job: Scan\n    steps:\n"
        if "SAST" in security:
            yaml += "    - script: echo 'SAST Scan'\n"
        if "Dependency Scan" in security:
            yaml += "    - script: echo 'Dependency Scan'\n"
        if "Docker Scan" in security:
            yaml += "    - script: echo 'Docker Scan'\n"
        if "Secret Detection" in security:
            yaml += "    - script: echo 'Secret Detection'\n"

    yaml += f"""
- stage: Publish
  jobs:
  - job: Push
    steps:
    - script: echo 'Pushing to {registry}'
"""

    for env in environments:
        yaml += f"""
- stage: Deploy_{env.replace(' ', '_')}
  jobs:
  - deployment: Deploy
    environment: '{env}'
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo 'Deploying to {deployment}'
"""

    return yaml


# ================================
# GENERATE PIPELINE API
# ================================

@api_view(['POST'])
def generate_pipeline(request):

    ci_cd            = request.data.get("ci_cd", "GitHub Actions")
    environments     = request.data.get("environments", [])
    deployment       = request.data.get("deployment", "")
    security         = request.data.get("security", [])
    branch_strategy  = request.data.get("branchStrategy", "")
    registry         = request.data.get("registry", "")
    advanced_options = request.data.get("advancedOptions", {})

    pipeline = ""

    if ci_cd == "GitHub Actions":
        pipeline = generate_github_actions(environments, deployment, security, branch_strategy, registry, advanced_options)
    elif ci_cd == "GitLab CI":
        pipeline = generate_gitlab_ci(environments, deployment, security, branch_strategy, registry, advanced_options)
    elif ci_cd == "Jenkins":
        pipeline = generate_jenkins(environments, deployment, security, branch_strategy, registry, advanced_options)
    elif ci_cd == "Azure DevOps":
        pipeline = generate_azure_devops(environments, deployment, security, branch_strategy, registry, advanced_options)
    else:
        pipeline = "# Unsupported CI/CD platform"

    return Response({"pipeline_yaml": pipeline})


# ================================
# DETECT TECHNOLOGIES
# ================================

def detect_technologies_from_package(package_json):

    technologies = []
    dependencies = {}

    if "dependencies" in package_json:
        dependencies.update(package_json["dependencies"])

    if "devDependencies" in package_json:
        dependencies.update(package_json["devDependencies"])

    if "react"        in dependencies: technologies.append("React")
    if "vite"         in dependencies: technologies.append("Vite")
    if "next"         in dependencies: technologies.append("Next.js")
    if "express"      in dependencies: technologies.append("Express.js")
    if "tailwindcss"  in dependencies: technologies.append("Tailwind CSS")
    if "typescript"   in dependencies: technologies.append("TypeScript")

    return technologies


# ================================
# GENERATE DYNAMIC YAML PIPELINE
# ================================

def generate_yaml_pipeline(technologies):

    pipeline = """
name: AI Generated Pipeline

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
"""

    if "React" in technologies or "Node.js" in technologies:
        pipeline += """
  frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Dependencies
        run: npm install

      - name: Build Project
        run: npm run build
"""

    if "Next.js" in technologies:
        pipeline += """
      - name: Build Next.js
        run: npm run build
"""

    if "TypeScript" in technologies:
        pipeline += """
      - name: Lint Project
        run: npm run lint
"""

    if "Django" in technologies:
        pipeline += """
  backend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Python Dependencies
        run: pip install -r requirements.txt

      - name: Django Checks
        run: python manage.py check
"""

    return pipeline


# ================================
# GITHUB ANALYZE API
# ================================

@api_view(['POST'])
def github_analyze(request):

    github_url = request.data.get("github_url")

    repo_path = github_url.replace(
        "https://github.com/", ""
    ).replace(".git", "")

    api_url = f"https://api.github.com/repos/{repo_path}/contents"

    headers = {"Authorization": f"token {GITHUB_TOKEN}"}

    response = requests.get(api_url, headers=headers)

    files = response.json()

    filenames = [file["name"] for file in files if "name" in file]

    technologies = []

    if "package.json" in filenames:

        package_url = f"https://api.github.com/repos/{repo_path}/contents/package.json"

        package_response = requests.get(package_url, headers=headers)
        package_data     = package_response.json()

        content      = base64.b64decode(package_data["content"]).decode("utf-8")
        package_json = json.loads(content)

        technologies.extend(detect_technologies_from_package(package_json))
        technologies.append("Node.js")

    if "requirements.txt" in filenames: technologies.append("Python")
    if "manage.py"        in filenames: technologies.append("Django")
    if "Dockerfile"       in filenames: technologies.append("Docker")

    pipeline_yaml = generate_yaml_pipeline(technologies)

    return Response({
        "repository":    repo_path,
        "files_scanned": len(filenames),
        "technologies":  technologies,
        "files":         filenames,
        "pipeline_yaml": pipeline_yaml,
        "pipeline":      pipeline_yaml,
        "status":        "Analysis Complete",
    })


# ================================
# GITHUB OAUTH - LOGIN
# ================================

@api_view(['GET'])
def github_login(request):

    client_id    = os.getenv("GITHUB_CLIENT_ID")
    redirect_uri = os.getenv("GITHUB_REDIRECT_URI")

    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&scope=repo workflow"
    )

    return JsonResponse({"auth_url": github_auth_url})


# ================================
# GITHUB OAUTH - CALLBACK
# ================================

@api_view(['GET'])
def github_callback(request):

    code = request.GET.get("code")

    token_url = "https://github.com/login/oauth/access_token"

    payload = {
        "client_id":     os.getenv("GITHUB_CLIENT_ID"),
        "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
        "code":          code,
    }

    headers = {"Accept": "application/json"}

    response = requests.post(token_url, data=payload, headers=headers)

    data         = response.json()
    access_token = data.get("access_token")

    return Response({"access_token": access_token})


# ================================
# PUSH YAML TO REPO
# ================================

@api_view(['POST'])
def push_yaml(request):

    # =====================================
    # USE BACKEND TOKEN FROM .ENV
    # =====================================

    token = GITHUB_TOKEN

    # =====================================
    # REQUEST DATA
    # =====================================

    repo_name = request.data.get("repo")
    branch = request.data.get("branch", "main")
    yaml_content = request.data.get("yaml_content")

    commit_msg = request.data.get(
        "commit_message",
        "chore: add AI-generated pipeline"
    )

    file_path = ".github/workflows/smart-pipeline.yml"

    # =====================================
    # VALIDATIONS
    # =====================================

    if not token:
        return Response({
            "status": "error",
            "message": "GITHUB_TOKEN missing in .env"
        }, status=400)

    if not repo_name:
        return Response({
            "status": "error",
            "message": "Repository name missing"
        }, status=400)

    if not yaml_content:
        return Response({
            "status": "error",
            "message": "yaml_content is empty"
        }, status=400)

    # =====================================
    # DEBUG LOGS
    # =====================================

    print("\n========== PUSH DEBUG ==========")
    print("REPOSITORY:", repo_name)
    print("BRANCH:", branch)

    # =====================================
    # GITHUB API URL
    # =====================================

    api_url = (
        f"https://api.github.com/repos/"
        f"{repo_name}/contents/{file_path}"
    )

    print("UPLOAD URL:", api_url)

    # =====================================
    # HEADERS
    # =====================================

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    # =====================================
    # CHECK FILE EXISTS
    # =====================================

    check_res = requests.get(
        api_url,
        headers=headers,
        params={"ref": branch}
    )

    print("CHECK STATUS:", check_res.status_code)

    # =====================================
    # ENCODE YAML CONTENT
    # =====================================

    encoded_content = base64.b64encode(
        yaml_content.encode("utf-8")
    ).decode("utf-8")

    payload = {
        "message": commit_msg,
        "content": encoded_content,
        "branch": branch
    }

    # =====================================
    # UPDATE EXISTING FILE
    # =====================================

    if check_res.status_code == 200:

        existing_sha = check_res.json().get("sha")

        payload["sha"] = existing_sha

        print("MODE: UPDATE EXISTING FILE")

    else:

        print("MODE: CREATE NEW FILE")

    # =====================================
    # PUSH TO GITHUB
    # =====================================

    put_res = requests.put(
        api_url,
        headers=headers,
        json=payload
    )

    print("PUT STATUS:", put_res.status_code)
    print("PUT RESPONSE:", put_res.text)

    # =====================================
    # SUCCESS
    # =====================================

    if put_res.status_code in [200, 201]:

        data = put_res.json()

        return Response({
            "status": "success",
            "branch": branch,
            "file_path": file_path,
            "commit_sha": data["commit"]["sha"],
            "github_url": data["content"]["html_url"]
        })

    # =====================================
    # ERROR
    # =====================================

    return Response({
        "status": "error",
        "message": put_res.text
    }, status=put_res.status_code)



# ================================
# CREATE / ENSURE BRANCH EXISTS
# ================================

@api_view(['POST'])
def manage_branch(request):
    from github import Github, GithubException

    token     = request.data.get("token")
    repo_name = request.data.get("repo")
    branch    = request.data.get("branch")
    base      = request.data.get("base_branch", "main")

    try:
        g    = Github(token)
        repo = g.get_repo(repo_name)

        try:
            existing = repo.get_branch(branch)
            return Response({"status": "exists", "branch": branch, "sha": existing.commit.sha})
        except GithubException:
            pass

        base_branch = repo.get_branch(base)
        repo.create_git_ref(ref=f"refs/heads/{branch}", sha=base_branch.commit.sha)

        return Response({"status": "created", "branch": branch, "base": base, "sha": base_branch.commit.sha})

    except GithubException as e:
        return Response({"status": "error", "message": str(e)}, status=400)


