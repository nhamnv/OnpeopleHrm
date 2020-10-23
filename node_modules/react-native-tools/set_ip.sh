#!/bin/zsh

ip=$(ipconfig getifaddr en0)

echo "Current IP is ${ip}"
sed -E -i "" "s%http://(localhost|[0-9.]+)%http://${ip}%g" ios/countables/AppDelegate.m
echo "Changed IP in AppDelegate"
sed -E -i "" "s%http://(localhost|[0-9.]+)%http://${ip}%g" node_modules/react-native/Libraries/WebSocket/RCTWebSocketExecutor.m
echo "Changed IP in RCTWebSocketExecutor"

# This only works on Mac, in the zsh shell, and only fixes the iOS device build.
