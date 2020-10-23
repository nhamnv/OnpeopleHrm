var fs = require('fs');
var readlineSync = require('readline-sync');

function createComponentFile() {
  var componentName = readlineSync.question(`Name of component: `);
  var filePath = readlineSync.question(`File path: `);
  var specialComponents = readlineSync.question(`Special components? `);
  var styleSheet = readlineSync.question(`Stylesheet? `);

  const dirCount = filePath.match(/\//g) && filePath.match(/\//g).length;

  if (styleSheet === 'y' || styleSheet === 'yes' || styleSheet === 'true') {
    styleSheet = `import styles from '${'../'.repeat(dirCount || 1)}styles/stylesheet';`;
  } else {
    styleSheet = ``;
  }

  var globalState = `import globalState from '${'../'.repeat(dirCount || 1)}globalState';`;

  var componentDoc =
  `'use strict';

  import React, {
    View,
    Text,
    ${specialComponents.replace(/ /g, ',\n  ')}
  } from 'react-native';

  ${globalState}
  ${styleSheet}

  var ${componentName} = React.createClass({

    render: function() {
      return (

      );
    }
  })


  export default ${componentName};`;

  fs.writeFile(`${filePath}/${componentName}.js`, componentDoc, function(err){
    if (err) {
      console.log("Problem creating component file");
      process.exit(1);
    }

    console.log("Component created");
    process.exit(0);
  })
}

export default createComponentFile