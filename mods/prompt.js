stringSynonyms = ["string","str","st","s"];
numberSynonyms = ["number","num","nm","nu","n","integer","int","i","float","flt","f", //we will say integer but actually make it a float, how evil
						 "wholenumber","decimalnumber","wn","dn","w","d","deeznuts"]; //Alice (software) reference, and an excuse to include deez nuts
booleanSynonyms = ["boolean", "bool", "boo", "bo", "bl", "b"];
//arraySynonyms = ["array","arr","ar","a","list","lst","l"]; //why
//objectSynonyms = ["object","obj","ob","o","json"]; //I have no plans to implement these.
trueSynonyms = ["true", "t", "1", "yes"];
falseSynonyms = ["false", "f", "0", "no"];
defaultStringTypeValues = ["element","color"];
defaultNumberTypeValues = ["x","y","temp","start"];

function rgbStringToUnvalidatedObject(string) {
	string = string.split(",");
	var red = parseFloat(string[0].substring(4));
	var green = parseFloat(string[1]);
	var blue = parseFloat(string[2].slice(0,-1));
	return {r: red, g: green, b: blue};
}

function funniPrompt() {
	var inputText = prompt("Enter command");
	// replace spaces with underscores
	inputAsArray = inputText.split(" ");
	var firstItem = inputAsArray[0];
	
	switch(firstItem) {
		case "set":
			//alert("To do");
			if(inputAsArray.length < 4) {
				alert("Usage: set [property] [element] [value] <type>	\nArguments are typed without framing characters.	\nThe element can be \"all\" to set the property for every pixel.	\nNote: Strings can't have spaces because spaces are the separator used in the parsing split().	\nArguments in [brackets] are required and ones in <angle brackets> are optional.");
				break;
			};
			var property = inputAsArray[1];
			//console.log("Property gotten: " + property);
			var inputElement = inputAsArray[2];
			//console.log("Element gotten: " + inputElement);
			var value = inputAsArray[3];
			//console.log("Value gotten: " + value);
			var type = null; //dummy type for [value]-based assumption
			if(inputAsArray.length >= 5) {
				type = inputAsArray[4];
			};
			//console.log("Type gotten: " + type);
			
			if(type === null) {
				type = null; //catch null type
			} else if(numberSynonyms.includes(type.toLowerCase())) {
				type = "number";
			} else if(booleanSynonyms.includes(type.toLowerCase())) {
				type = "boolean";
			} else if(stringSynonyms.includes(type.toLowerCase())) {
				type = "string";
			} /*else if(arraySynonyms.includes(type.toLowerCase())) { //I have no plans to implement these.
				type = "array";
			} else if(objectSynonyms.includes(type.toLowerCase())) {
				type = "object";
			}*/ else {
				alert("Unrecognized type: \"" + type + "\"");
				break;
			};
			
			if(type === null) {
				if(defaultStringTypeValues.includes(property)) {
					type = "string";
				} else if(defaultNumberTypeValues.includes(property)) {
					type = "number";
				} else {
					alert("Type could not be assumed from property. Please specify the type as a fourth argument.");
					break;
				}
			}
			
			if(type === "number") {
				value = parseFloat(value);
				if(isNaN(value)) {
					alert("Value is not a number!");
					break;
				};
			} else if(type === "boolean") {
				if(trueSynonyms.includes(value.toLowerCase())) {
					value = true;
				} else if(falseSynonyms.includes(value.toLowerCase())) {
					value = false;
				} else {
					alert("Unrecognized boolean value: " + value);
					break;
				}
			}
			//The values start out as strings when split from the array, so string is kind of the default form.
			
			//Special validation
			
			if(property === "element") {
				var originalInput = value; //for error display
				value = mostSimilarElement(value);
				if(!elements[value]) {
					alert("Element " + originalInput + " does not exist!");
					break;
				}
			};
			if(property === "x") {
				if(!Number.isSafeInteger(value)) {
					alert("X cannot be a decimal! And what are you doing trying to set position values anyway?");
					break;
				}
			};
			if(property === "color") {
				if(!value.startsWith("rgb(") || value.split(",").length !== 3) {
					alert("Color must be in the form \"rgb(red,green,blue)\"!");
					break;
				}
				var checkedColorObject = rgbStringToUnvalidatedObject(value);
				if(isNaN(checkedColorObject.r) || isNaN(checkedColorObject.g) || isNaN(checkedColorObject.b)) {
					console.log(checkedColorObject);
					alert("One or more color values are invalid!");
					break;
				}
			};
			
			//Actual setting code;
			for (var i = 1; i < width; i++) {
				for (var j = 1; j < height; j++) {
					if (!isEmpty(i,j)) {
						//console.log("Pixel (" + i + "," + j + ") exists")
						if(pixelMap[i][j].element === inputElement || inputElement === "all") {
							//console.log("Element is a match: " + inputElement + ", " + pixelMap[i][j].element)
							pixelMap[i][j][property] = value;
						};
					};
				};
			};
			break;
		case "test":
			alert("pong");
			console.log("qwertyuiopasdfghjklzxcvbnm");
			break;
		case "fill":
			if(inputAsArray.length < 3) {
				alert("Usage: fill [overwrite (should be a bool)] [element] <additional elements>.	\nArguments in [brackets] are required and ones in <angle brackets> are optional.");
				break;
			};
			
			var doOverwrite = inputAsArray[1];
			
			var elementList = inputAsArray.slice(2);
			//console.log(elementList);
			
			for(i = 0; i < elementList.length; i++) {
				var elementInConsideration = elementList[i]
				var originalElement = elementInConsideration; //also for error display
				elementInConsideration = mostSimilarElement(elementInConsideration);
				if(!elements[elementInConsideration]) {
					alert("Element " + originalElement + " does not exist!");
					break;
				}
				elementList[i] = elementInConsideration;
			};
			//console.log(elementList);
			
			if(trueSynonyms.includes(doOverwrite.toLowerCase())) {
				doOverwrite = true;
			} else if(falseSynonyms.includes(doOverwrite.toLowerCase())) {
				doOverwrite = false;
			} else {
				alert("Unrecognized boolean value: " + value);
				break;
			}
			//console.log(doOverwrite);
			//console.log(elementList);
			
			//Fill code
			for (var i = 1; i < width; i++) {
				for (var j = 1; j < height; j++) {
					var randomElement = elementList[Math.floor(Math.random() * elementList.length)];
					if(doOverwrite) {
						if(!isEmpty(i,j,true)) { deletePixel(i,j) };
					};
					if (isEmpty(i,j,false)) {
						createPixel(randomElement,i,j);
					};
				};
			};
			break;
		case "randomfill":
			if(inputAsArray.length < 1) { //somehow?
				alert("Usage: randomfill <overwrite (should be a bool) (default: true)>	\nArguments in <angle brackets> are optional.");
				break;
			};
			
			var doOverwrite = null;
			
			if(inputAsArray.length > 1) {
				var doOverwrite = inputAsArray[1];
				if(trueSynonyms.includes(doOverwrite.toLowerCase())) {
					doOverwrite = true;
				} else if(falseSynonyms.includes(doOverwrite.toLowerCase())) {
					doOverwrite = false;
				} else {
					alert("Unrecognized boolean value: " + value);
					break;
				};
			} else {
				doOverwrite = true;
			};
			
			var elementList = randomChoices;
			
			//Fill code
			for (var i = 1; i < width; i++) {
				for (var j = 1; j < height; j++) {
					var randomElement = elementList[Math.floor(Math.random() * elementList.length)];
					if(doOverwrite) {
						if(!isEmpty(i,j,true)) { deletePixel(i,j) };
					};
					if (isEmpty(i,j,false)) {
						createPixel(randomElement,i,j);
					};
				};
			};
			break;
		default:
			alert(`Command ${firstItem} not found!`);
	};
};

