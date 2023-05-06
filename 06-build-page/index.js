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


async function mergeCss(sourceDirectory, destinationDirectory) {
  await fs.mkdir(destinationDirectory, {recursive: true});
  // метод read.dir возвращает массив объектов, чтобы в нем было доступны типы файлов передаем в аргуметах такую опцию
  const fileObjects = await fs.readdir(sourceDirectory, {withFileTypes: true});
  // фильтруем только те файлы что с расширением css и возвращаем их имена
  const cssFileNames = fileObjects.filter(f => f.isFile() && path.extname(f.name) === '.css').map(f => f.name);
  // читаем содержимое этих файлов - в резельтате в bufferList массив объектов buffer(cсодержимое в двоичной форме)
  const bufferList = await Promise.all(cssFileNames.map(cssFileName => fs.readFile(path.join(sourceDirectory, cssFileName))));
  // сначала склеиваем conccat  все буферы в один, записываем в файл 
  await fs.writeFile(path.join(destinationDirectory, 'bundle.css'), Buffer.concat(bufferList));
}

async function prepareHtml(componentsDirectory, templateFile, destinationFile){
  // получаем как строку за счет параметра utf-8', благодаря ему получаем текстовое содержимое
  const templateHtml = await fs.readFile(templateFile, 'utf-8');
  // сканируем содержимое каталога компонентов
  const componentNames = (await fs
    .readdir(componentsDirectory, {withFileTypes: true})) // вторая опция позволяет позже использовать isfile
    .filter(f => f.isFile() && path.extname(f.name) === '.html') // фильтруем только html-файлы - извлекаем расширение и по нему сравниваем
    .map(f => path.parse(f.name).name); // возвращаем имя файла без разширения - оно и будет именем компонента
  const components = new Map(); // заполняем map компонентами  пока пустыми
  // для каждого компонента 
  await Promise.all(componentNames.map(async (componentName) => { // загружаем содержимое связанного с компонентом файла
    const componentHtml = await fs.readFile(path.join(componentsDirectory, `${componentName}.html`), 'utf-8');
    components.set(componentName, componentHtml); // сохраняем в map  ключи значение: имя компонента и содежимое его файла в виде текста
  }));
  
  // в шаблоне ищем все вхождения вида {{componentName}} и заменяем их html-текстом этих компонентов
  const resultHtml = templateHtml.replace(/{{([\w\-_]+)}}/g, (text, name) => components.get(name)); 
  await fs.writeFile(destinationFile, resultHtml, 'utf-8'); // записываем в выходной файл
}

async function main(){
 await copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));
 await mergeCss(path.join(__dirname, 'styles'), path.join(__dirname, 'project-dist', 'styles'));
 await prepareHtml(path.join(__dirname, 'components'), path.join(__dirname, 'template.html'), path.join(__dirname, 'project-dist', 'index.html'));
}



main().catch(console.trace);