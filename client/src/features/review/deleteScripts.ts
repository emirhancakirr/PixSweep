/**
 * Script generation utilities for manual file deletion
 * Used when File System Access API is not available
 */

const UNIX_SCRIPT = `#!/bin/bash
# Delete files listed in files-to-delete.txt
# Usage: ./delete-files.sh <base-directory>
# Example: ./delete-files.sh /Users/username/Pictures

if [ -z "$1" ]; then
    echo "Usage: $0 <base-directory>"
    echo "Example: $0 /Users/username/Pictures"
    exit 1
fi

BASE_DIR="$1"
FILE_LIST="files-to-delete.txt"

if [ ! -f "$FILE_LIST" ]; then
    echo "Error: $FILE_LIST not found. Please download the file list first."
    exit 1
fi

while IFS= read -r file; do
    if [ -n "$file" ]; then
        FULL_PATH="$BASE_DIR/$file"
        if [ -f "$FULL_PATH" ]; then
            rm "$FULL_PATH"
            echo "Deleted: $FULL_PATH"
        else
            echo "Warning: File not found: $FULL_PATH"
        fi
    fi
done < "$FILE_LIST"

echo "Deletion complete!"`;

const WINDOWS_SCRIPT = `@echo off
REM Delete files listed in files-to-delete.txt
REM Usage: delete-files.bat <base-directory>
REM Example: delete-files.bat C:\\Users\\username\\Pictures

if "%~1"=="" (
    echo Usage: %0 ^<base-directory^>
    echo Example: %0 C:\\Users\\username\\Pictures
    exit /b 1
)

set BASE_DIR=%~1
set FILE_LIST=files-to-delete.txt

if not exist "%FILE_LIST%" (
    echo Error: %FILE_LIST% not found. Please download the file list first.
    exit /b 1
)

for /f "usebackq delims=" %%f in ("%FILE_LIST%") do (
    set "file=%%f"
    if not "!file!"=="" (
        set "FULL_PATH=%BASE_DIR%\\!file!"
        if exist "!FULL_PATH!" (
            del /f "!FULL_PATH!"
            echo Deleted: !FULL_PATH!
        ) else (
            echo Warning: File not found: !FULL_PATH!
        )
    )
)

echo Deletion complete!
pause`;

/**
 * Detects if the current platform is Windows
 */
function isWindows(): boolean {
    return navigator.platform.toLowerCase().includes('win');
}

/**
 * Gets the appropriate delete script for the current platform
 * @returns Object with script content and filename
 */
export function getDeleteScript(): { script: string; filename: string } {
    const isWin = isWindows();
    return {
        script: isWin ? WINDOWS_SCRIPT : UNIX_SCRIPT,
        filename: isWin ? 'delete-files.bat' : 'delete-files.sh',
    };
}

/**
 * Downloads the delete script as a file
 */
export function downloadDeleteScript(): void {
    const { script, filename } = getDeleteScript();
    
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

