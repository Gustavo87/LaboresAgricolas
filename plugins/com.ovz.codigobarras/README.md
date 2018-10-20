# Install

Checkout this repo and switch to the swift branch then install with

    $ cordova plugin add <path>

Afterwards open xcode by 

    $ open platforms/ios/<Project Name>.xcodeproj
    
go into settings change `deployment target` to 7.0 or above and add `<Project Name>/Plugins/com.example.hello/Bridging-Header.h` to Objective-c Bridging Header under the Swift Compiler - Code Generation options

Finally add the following `LD_RUNPATH_SEARCH_PATHS = "$(inherited) @executable_path/Frameworks";`

# Test

Add the following to index.js onDeviceReady:
```js

var win = function (result) {
    alert(result);      
}, 
fail = function (error) {
    alert("ERROR " + error);
};

hello.greet("World", win, fail);

```