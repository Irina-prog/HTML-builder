const fs = require('fs/promises'); // модуль для работы с файлами методы которого возвращают промисы
const path = require('path'); // модуль для работы с путями

async function mergeCss(sourceDirectory, destinationDirectory) {
  // метод read.dir возвращает массив объектов, чтобы в нем было доступны типы файлов передаем в аргуметах такую опцию
  const fileObjects = await fs.readdir(sourceDirectory, {withFileTypes: true});
  // фильтруем только те файлы что с расширением css и возвращаем их имена
  const cssFileNames = fileObjects.filter(f => f.isFile() && path.extname(f.name) === '.css').map(f => f.name);
  // читаем содержимое этих файлов - в резельтате в bufferList массив объектов buffer(cсодержимое в двоичной форме)
  const bufferList = await Promise.all(cssFileNames.map(cssFileName => fs.readFile(path.join(sourceDirectory, cssFileName))));
  // сначала склеиваем conccat  все буферы в один, записываем в файл 
  await fs.writeFile(path.join(destinationDirectory, 'bundle.css'), Buffer.concat(bufferList));
}
// вызываем функцию, передаем папку из которой взять файлы и куда записать и обрабатываем ошибки
mergeCss(path.join(__dirname, 'styles'), path.join(__dirname, 'project-dist')).catch(console.trace);