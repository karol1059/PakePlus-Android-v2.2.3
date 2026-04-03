@echo off
setlocal

:: 创建临时目录
mkdir temp_package

:: 复制必要文件到临时目录
copy index.html temp_package\
copy style.css temp_package\
xcopy js temp_package\js /E /I
xcopy images temp_package\images /E /I
xcopy audio temp_package\audio /E /I

:: 进入临时目录并打包
cd temp_package
powershell -Command "Compress-Archive -Path * -DestinationPath ../cinema_game_v1.0.203.zip -Force"

:: 清理临时目录
cd ..
rd /s /q temp_package

echo 打包完成！
pause