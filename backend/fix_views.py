import pathlib

content = open(r"C:\Users\Gokul\OneDrive\Desktop\Gen-Pipe\backend\pipeline_generator\views.py", encoding="utf-8").read()

# Find where github_callback return statement ends and cut everything after
cut_point = content.find("return Response({\"access_token\": access_token})")
if cut_point == -1:
    cut_point = content.find("return Response({\n        \"access_token\": access_token")

good_part = content[:cut_point + 100]  # include the return line

new_push_yaml = '''


# ================================
# PUSH YAML TO REPO
# ================================

@api_view([\'POST\'])
def push_yaml(request):

    token        = request.data.get("token")
    repo_name    = request.data.get("repo")
    branch       = request.data.get("branch", "main")
    yaml_content = request.data.get("yaml_content")
    commit_msg   = request.data.get("commit_message", "chore: add AI-generated pipeline")
    file_path    = ".github/workflows/smart-pipeline.yml"

    if not yaml_content:
        return Response({"status": "error", "message": "yaml_content is empty"}, status=400)

    headers = {
        "Authorization":        f"Bearer {token}",
        "Accept":               "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    api_url   = f"https://api.github.com/repos/{repo_name}/contents/{file_path}"
    check_res = requests.get(api_url, headers=headers, params={"ref": branch})

    encoded_content = base64.b64encode(yaml_content.encode("utf-8")).decode("utf-8")

    payload = {"message": commit_msg, "content": encoded_content, "branch": branch}

    if check_res.status_code == 200:
        payload["sha"] = check_res.json().get("sha")
        action = "updated"
    else:
        action = "created"

    put_res = requests.put(api_url, json=payload, headers=headers)

    if put_res.status_code in [200, 201]:
        return Response({
            "status":     "success",
            "action":     action,
            "commit_sha": put_res.json()["commit"]["sha"],
            "file_path":  file_path,
            "branch":     branch,
        })

    return Response({"status": "error", "message": put_res.text}, status=put_res.status_code)


# ================================
# CREATE / ENSURE BRANCH EXISTS
# ================================

@api_view([\'POST\'])
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


# ================================
# TRIGGER WORKFLOW DISPATCH
# ================================

@api_view([\'POST\'])
def trigger_workflow(request):

    token         = request.data.get("token")
    repo_name     = request.data.get("repo")
    branch        = request.data.get("branch", "main")
    workflow_file = request.data.get("workflow_file", "smart-pipeline.yml")

    url = f"https://api.github.com/repos/{repo_name}/actions/workflows/{workflow_file}/dispatches"

    headers = {
        "Authorization":        f"Bearer {token}",
        "Accept":               "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    response = requests.post(url, json={"ref": branch}, headers=headers)

    if response.status_code == 204:
        return Response({"status": "triggered", "branch": branch, "workflow": workflow_file})

    return Response({"status": "error", "message": response.text}, status=response.status_code)
'''

final = good_part + new_push_yaml

with open(r"C:\Users\Gokul\OneDrive\Desktop\Gen-Pipe\backend\pipeline_generator\views.py", "w", encoding="utf-8") as f:
    f.write(final)

print("Done! views.py fixed successfully.")