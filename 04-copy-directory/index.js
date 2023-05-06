const fs = require('fs/promises'); // модуль для работы с файлами методы которого возвращают промисы
const path = require('path'); // модуль для работы с путями

async function copyDir(sourceDirectory, destinationDirectory){
  await fs.mkdir(destinationDirectory, {recursive: true}); // с параметром recursive: true функция mkdir 
  // не выкинет исключения если каталог уже есть
  const items = await fs.readdir(sourceDirectory, {withFileTypes: true}); // получаем содержимое исходного source directory
  // получаем список файлов в каталоге destination directory - в виде массива строчек имен этих файлов
  let existingFiles = (await fs.readdir(destinationDirectory, {withFileTypes: true})).filter(f => f.isFile()).map(f => f.name); 
  for (const item of items) { // перебираем и анализируем
    if (item.isFile()){ // если это файл
      // то копируем его в новое место
      await fs.copyFile(path.join(sourceDirectory,item.name), path.join(destinationDirectory, item.name)); 
      // и удаляем имя этого файла из  списка existingFiles
      existingFiles = existingFiles.filter(fileName => fileName !== item.name); 
    }
    if (item.isDirectory()){ // если это была директория то просто копируем ее с помощью исходной функции
      await copyDir(path.join(sourceDirectory,item.name), path.join(destinationDirectory, item.name));
    }
  }
  for (const fileName of existingFiles) { // в результате в existingFiles должны остаться только те которых нет в sourceDirectory
    await fs.unlink(path.join(destinationDirectory, fileName)); // удаляем эти файлы из destination directory
  }

}
copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy')).catch(console.trace);