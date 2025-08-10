
# CodeChef Template Paster

Easily paste your favorite code templates into CodeChef with this Chrome extension. Save, manage, and use templates for C++, Java, Python, C, and JavaScript with a clean, modern interface.

## What You Get

- **Instant template pasting**
- **Save and manage your templates**
- **Automatic language selection**
- **Works with all CodeChef editors**
- **Simple, beautiful popup UI**

## How to Install

1. Download or clone this folder to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select this folder.
5. (Optional) Pin the extension for quick access.

## How to Use

1. Go to any CodeChef problem page and let it load.
2. Click the extension icon to open the popup.
3. Select a language and enter your template code, or use the default ones.
4. Click "Save Template" to store it.
5. Click "Paste to CodeChef" to insert your code automatically.
6. Manage your templates in the popup: load, delete, or clear as needed.

## Default Templates

### C++
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
   ios_base::sync_with_stdio(false);
   cin.tie(NULL);
   int t;
   cin >> t;
   while(t--) {
        
   }
   return 0;
}
```

### Python
```python
import sys
input = sys.stdin.readline

def solve():
   pass

t = int(input())
for _ in range(t):
   solve()
```

### Java
```java
import java.util.*;
import java.io.*;

public class Main {
   public static void main(String[] args) throws IOException {
      BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
      int t = Integer.parseInt(br.readLine());
      while(t-- > 0) {
            
      }
   }
}
```