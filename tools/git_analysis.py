import os
import csv
from git import Repo
from datetime import datetime

# Make sure to run 'pip install gitpython' in your local environment before running the script

# CHANGE THIS TO YOUR REPOSITORY PATH
repo_path = "C:\\Projects\\abc\\documentation"

# Specify the commit hashes to ignore (optional)
ignored_commit_hashes = ["488fff7c1a8e2297161cc4a5f2eb27b886a1d2c6", "e96ad28c0b059961cfc8c99a5ea84aea18dfe31a"]

def get_repository_files(path, ignored_commit_hashes=None):
    repo = Repo(path)

    files = {}
    total_commits = sum(1 for _ in repo.iter_commits())  # Count total number of commits
    current_commit = 0

    for commit in repo.iter_commits():
        current_commit += 1

        if current_commit % 100 == 0:
            print(f"Processing commit {current_commit}/{total_commits}")

        commit_hash = commit.hexsha
        commit_author = commit.author.name  
        url = repo.remotes.origin.url.replace(".git", "") #Fixes the url 
        commit_link = f"{url}/commit/{commit_hash}"
        
        for modified_file in commit.stats.files:
            file_path = os.path.join(path, modified_file)
            
            # Ignore files from the specified commit hashes
            if ignored_commit_hashes is not None and commit_hash in ignored_commit_hashes:
                continue

            # Ignore every file that it's not mdx
            if os.path.splitext(file_path)[1] != ".mdx":
                continue

            # Check if the file exists in the operating system. This is to make sure git doesn't list files that no longer exist in the repo
            if os.path.isfile(file_path):
                last_update = datetime.fromtimestamp(commit.committed_date).strftime("%Y-%m-%d %H:%M:%S")
                
                if file_path in files:
                    if last_update > files[file_path]["Last Update"]:
                        files[file_path]["Last Update"] = last_update
                        files[file_path]["Commit Author"] = commit_author
                        files[file_path]["Commit Link"] = commit_link
                else:
                    files[file_path] = {"Last Update": last_update, "Commit Author": commit_author, "Commit Link": commit_link}

    return files

print("Retrieving repository files...")
repository_files = get_repository_files(repo_path, ignored_commit_hashes)

current_csv_file_path = "output_current.csv"
filtered_csv_file_path = "output_filtered.csv"

# Full file with versioned and latest content
print(f"Saving current data to: {current_csv_file_path}")
with open(current_csv_file_path, "w", newline="") as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=["File Path", "Last Update", "Commit Author", "Commit Link"])
    writer.writeheader()
    for file_path, file_info in repository_files.items():
        rel_file_path = file_path.replace(repo_path, "").strip("\\")
        writer.writerow({"File Path": rel_file_path, "Last Update": file_info["Last Update"], "Commit Author": file_info["Commit Author"], "Commit Link": file_info["Commit Link"]})

print(f"Data saved to: {current_csv_file_path}")

# File with just the latest content
filtered_files = {file_path: file_info for file_path, file_info in repository_files.items() if "versioned_docs" not in file_path}

print(f"Saving filtered data to: {filtered_csv_file_path}")
with open(filtered_csv_file_path, "w", newline="") as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=["File Path", "Last Update", "Commit Author", "Commit Link"])
    writer.writeheader()
    for file_path, file_info in filtered_files.items():
        rel_file_path = file_path.replace(repo_path, "").strip("\\")
        writer.writerow({"File Path": rel_file_path, "Last Update": file_info["Last Update"], "Commit Author": file_info["Commit Author"], "Commit Link": file_info["Commit Link"]})

print(f"Data saved to: {filtered_csv_file_path}")