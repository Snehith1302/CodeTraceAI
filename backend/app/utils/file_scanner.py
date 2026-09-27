import os
from pathlib import Path
from app.config import settings

EXCLUDED_DIRS = {
    "venv",
    ".venv",
    "__pycache__",
    "node_modules",
    ".git",
    "build",
    "dist",
    ".pytest_cache",
    ".egg-info",
    ".idea",
    ".vscode",
}

def scan_python_files(project_path: str, max_files: int = None) -> tuple[list[Path], list[Path]]:
    """
    Recursively scans the project directory for Python files (.py),
    excluding common virtualenv, build, and metadata directories.
    
    Returns:
        (file_list, skipped_list)
        where file_list are valid Path objects relative to project_path,
        and max_files cap is enforced.
    """
    root = Path(project_path).resolve()
    if not root.exists():
        raise ValueError(f"Project directory path does not exist: {project_path}")
    if not root.is_dir():
        raise ValueError(f"Project path is not a directory: {project_path}")

    max_cap = max_files if max_files is not None else settings.MAX_FILES_PER_PROJECT
    collected_files: list[Path] = []
    skipped_files: list[Path] = []

    for dirpath, dirnames, filenames in os.walk(root):
        # Prune excluded directories in-place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS and not d.endswith(".egg-info")]

        for filename in sorted(filenames):
            if filename.endswith(".py"):
                full_path = Path(dirpath) / filename
                rel_path = full_path.relative_to(root)
                if len(collected_files) < max_cap:
                    collected_files.append(rel_path)
                else:
                    skipped_files.append(rel_path)

    return collected_files, skipped_files
