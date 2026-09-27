import os
import shutil
import tempfile
import logging
from pathlib import Path
from typing import Tuple, Optional
import git

logger = logging.getLogger(__name__)

def is_github_url(path_str: str) -> bool:
    """Returns True if input path string resembles a GitHub URL or git repository URL."""
    s = path_str.strip().lower()
    return s.startswith("http://") or s.startswith("https://") or s.startswith("git@") or "github.com" in s

def clone_github_repo(repo_url: str) -> Tuple[str, Optional[str]]:
    """
    Clones a remote git repository into a temporary directory using GitPython (depth=1).
    Returns (cloned_dir_path, error_message).
    """
    temp_dir = tempfile.mkdtemp(prefix="codetrace_repo_")
    try:
        logger.info(f"Cloning remote repository {repo_url} into {temp_dir}...")
        git.Repo.clone_from(repo_url.strip(), temp_dir, depth=1)
        return temp_dir, None
    except Exception as e:
        logger.error(f"Failed to clone repository {repo_url}: {e}")
        # Clean up temp dir on error
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
        return "", f"Failed to clone repository '{repo_url}': {str(e)}"
