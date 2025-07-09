# CodeChef Template Paster

A Chrome extension that automatically pastes template code into CodeChef's code editor, supporting multiple programming languages.

## Features

- 🚀 **Quick Template Pasting**: Instantly paste your favorite code templates
- 💾 **Template Storage**: Save and manage multiple templates for different languages
- 🎯 **Language Detection**: Automatically sets the correct language on CodeChef
- 📝 **Multi-Language Support**: Supports C++, Java, Python, C, and JavaScript
- 🎨 **Beautiful UI**: Modern and intuitive interface
- 💡 **Smart Editor Detection**: Works with CodeChef's various code editors

## Installation

1. **Download/Clone the Extension**
   - Download all files to a folder (e.g., `CodeChefTemplater`)

2. **Open Chrome Extensions Page**
   - Open Chrome and go to `chrome://extensions/`
   - Or click Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the Extensions icon (puzzle piece) in the toolbar
   - Pin the "CodeChef Template Paster" for easy access

## Usage

### 1. **Open CodeChef**
   - Navigate to any CodeChef problem page
   - Wait for the page to fully load

### 2. **Access the Extension**
   - Click the extension icon in Chrome toolbar
   - The popup will open with the template interface

### 3. **Create/Load Templates**

   **Option A: Use Pre-loaded Templates**
   - The extension comes with default templates for C++, Python, and Java
   - Click on any saved template to load it

   **Option B: Create Custom Templates**
   - Select your programming language
   - Enter your template code in the text area
   - Click "Save Template" to store it

### 4. **Paste Templates**
   - With your template loaded, click "Paste to CodeChef"
   - The code will be automatically inserted into CodeChef's editor
   - The language will be set automatically (if supported)

### 5. **Manage Templates**
   - View all saved templates in the "Saved Templates" section
   - Click any template to load it
   - Click "Delete" to remove unwanted templates
   - Use "Clear" to empty the current template

## Default Templates

The extension includes starter templates:

### C++ Template
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int t;
    cin >> t;
    
    while(t--) {
        // Your code here
        
    }
    
    return 0;
}
```

### Python Template
```python
import sys
input = sys.stdin.readline

def solve():
    # Your code here
    pass

t = int(input())
for _ in range(t):
    solve()
```

### Java Template
```java
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        int t = Integer.parseInt(br.readLine());
        
        while(t-- > 0) {
            // Your code here
            
        }
    }
}
```