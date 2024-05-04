//FINAL
const pathElements = pm.request.url.path;
const requestPath = pathElements.join('/');
let urlTemp = pm.collectionVariables.get("url"); 
    urlTemp += "/" + requestPath;

let authy = "JWT "+ pm.collectionVariables.get("auth");
let meth = pm.request.method;
console.log(meth);

if (meth == 'POST' || meth == 'PATCH' || meth == 'PUT') {
   
    let requestBody = pm.request.body;
    let originalRequestBody = JSON.parse(requestBody.raw);

    let keys = Object.keys(originalRequestBody);



    function processNestedObjectWrong(tempRequestBody) {
        const keys = Object.keys(tempRequestBody);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (typeof tempRequestBody[key] === "string") {
                tempRequestBody[key] = "qwerty"; 
            } 
            else if (Array.isArray(tempRequestBody[key])) {
                tempRequestBody[key] = ["abced", "qwerty"]; 
            } 
            else if (typeof tempRequestBody[key] === "object" && tempRequestBody[key] !== null) {
                // Recursively process nested objects
                tempRequestBody[key] = processNestedObjectWrong(tempRequestBody[key]);
            } 
            else if (typeof tempRequestBody[key] === "Bigint") {
                
                tempRequestBody[key] = Math.floor(1000 + Math.random() * 9000);
            }
            else if (typeof tempRequestBody[key] === "number") {
                
                tempRequestBody[key] = Math.floor(1000 + Math.random() * 9000);
            }
            else if (typeof tempRequestBody[key] === "boolean") {
                tempRequestBody[key] = "True"; 
            } 
            else {
                tempRequestBody[key] = " ";
            }
        }
        return tempRequestBody;
    }





    // TESTS FOR SENDING EMPTY VALUES
    for(let i=0; i<keys.length; i++)
    {
        const key = keys[i];
        let tempRequestBody = { ...originalRequestBody };

        if (typeof tempRequestBody[key] === "object" && tempRequestBody[key] !== null) {
            
            tempRequestBody[key] = { };
            
        }
        else if (typeof tempRequestBody[key] === "string") {
            tempRequestBody[key] = ""; // Replace with empty string
        } 
        else if (Array.isArray(tempRequestBody[key])) {
            tempRequestBody[key] = []; // Replace with empty list
        } 
        else if (typeof tempRequestBody[key] === "number") {
            //tempRequestBody[key] = Math.floor(1000 + Math.random() * 9000); // Replace number with random 4-digit number
            tempRequestBody[key] = null;
        } 
        else if (typeof tempRequestBody[key] === "boolean") {
            tempRequestBody[key] = null; // Replace boolean with null
        }
        else {
            tempRequestBody[key] = " ";
        }

        
        console.log(tempRequestBody)
        const tempRequest = {
            url : urlTemp,
            body : { mode: 'raw',
                    raw: JSON.stringify(tempRequestBody)
                },
            method: 'POST',
            header: {
                'Org': 'dev',
                'Content-Type': 'application/json',
                'Authorization': authy
            }
        };

    
            pm.sendRequest(tempRequest, (error, response) => {
                if (error) {
                    console.log(error);
                    reject(error);
                    }
                else {
                    console.log(`Response message for empty ${key} value:`, response.text());
                    pm.test(`response is not 500 and has a validation message for empty ${key} value`, () => {
                        if (response.code === 400) {
                            // Parse the response body if it's in JSON format
                            let responseBody = null;
                            try {
                                responseBody = response.text();
                            } catch (error) {
                                // Handle JSON parsing error if any
                                console.error("Error parsing JSON response body:", error);
                            }

                            // Check if the parsed body contains the specified message
                            if (responseBody.includes("Selected dataset is being used in another task. You can try later or unlock dataset from Data Ingestion.")) {
                                pm.expect.fail("Would have been 200, Dataset is locked");
                            } 
                            else {
                                // If response code is 400 but message not found, test passes
                                pm.expect(response.code).to.equal(400);
                            }
                        } 
                        else {
                                
                            pm.expect(response.code).not.to.equal(500); 
                            pm.expect(response.code).not.to.equal(401);
                            pm.expect(response.code).not.to.equal(200);
                        }
                        
                        

                        });
                    }
            
            });
    }



    //TESTS FOR REMOVING FIELDS
    for (let i = 0; i < keys.length; i++) {
    let missingKey = keys[i]; 
    let tempRequestBody = { ...originalRequestBody };
    delete tempRequestBody[missingKey];
    console.log(tempRequestBody);
    const tempRequest = {
            url : urlTemp,
            body : { mode: 'raw',
                raw: JSON.stringify(tempRequestBody)
            },
            method: 'POST',
            header: {
                'Org': 'dev',
                'Content-Type': 'application/json',
                'Authorization': authy
            }
        };
    
    
        pm.sendRequest(tempRequest, (error, response) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(`Response message for removed ${missingKey} field:`, response.text());
            pm.test(`response is not 500 and has a validation message for removed ${missingKey} field`, () => {
                        if (response.code === 400) {
                            // Parse the response body if it's in JSON format
                            let responseBody = null;
                            try {
                                responseBody = response.text();
                            } catch (error) {
                                // Handle JSON parsing error if any
                                console.error("Error parsing JSON response body:", error);
                            }

                            // Check if the parsed body contains the specified message
                            if (responseBody.includes("Selected dataset is being used in another task. You can try later or unlock dataset from Data Ingestion.")) {
                                pm.expect.fail("Would have been 200, Dataset is locked");
                            } 
                            else {
                                // If response code is 400 but message not found, test passes
                                pm.expect(response.code).to.equal(400);
                            }
                        }
                        else {
                                
                            pm.expect(response.code).not.to.equal(500); 
                            pm.expect(response.code).not.to.equal(401);
                            pm.expect(response.code).not.to.equal(200);
                        }
                        
                        

                    });
            }
        });


    }; 



    //TESTS TO CHECK RESPONSES FOR WRONG KEYS
    for(let i=0; i<keys.length; i++)
    {
        const key = keys[i];
        let tempRequestBody = { ...originalRequestBody };

        if (typeof tempRequestBody[key] === "object" && tempRequestBody[key] !== null) {
            tempRequestBody[key] = processNestedObjectWrong(tempRequestBody[key]); // Replace with wrong JSON object
        }
        else if (typeof tempRequestBody[key] === "string") {
            tempRequestBody[key] = "qwerty"; // Replace with wrong string
        } 
        else if (Array.isArray(tempRequestBody[key])) {
            tempRequestBody[key] = ["abced", "qwerty"]; // Replace with wrong list
        }  
        else if (typeof tempRequestBody[key] === "number") {
            tempRequestBody[key] = Math.floor(1000 + Math.random() * 9000); // Replace number with random 4-digit number
            
        } 
        else if (typeof tempRequestBody[key] === "boolean") {
            tempRequestBody[key] = "Talse"; // Replace boolean with string
        }
        else {
            tempRequestBody[key] = " ";
        }

        
        console.log(tempRequestBody)
        const tempRequest = {
            url : urlTemp,
            body : { mode: 'raw',
                    raw: JSON.stringify(tempRequestBody)
                },
            method: 'POST',
            header: {
                'Org': 'dev',
                'Content-Type': 'application/json',
                'Authorization': authy
            }
        };

    
        
            
            pm.sendRequest(tempRequest, (error, response) => {
                if (error) {
                    console.log(error);
                    reject(error);
                    }
                else {
                    console.log(`Response message for wrong ${key} value:`, response.text());
                    pm.test(`response is not 500 and has a validation message for wrong ${key} value`, () => {
                        if (response.code === 400) {
                            // Parse the response body if it's in JSON format
                            let responseBody = null;
                            try {
                                responseBody = response.text();
                            } catch (error) {
                                // Handle JSON parsing error if any
                                console.error("Error parsing JSON response body:", error);
                            }

                            // Check if the parsed body contains the specified message
                            if (responseBody.includes("Selected dataset is being used in another task. You can try later or unlock dataset from Data Ingestion.")) {
                                pm.expect.fail("Would have been 200, Dataset is locked");
                            } 
                            else {
                                // If response code is 400 but message not found, test passes
                                pm.expect(response.code).to.equal(400);
                            }
                        } 
                        else {
                                
                            pm.expect(response.code).not.to.equal(500); 
                            pm.expect(response.code).not.to.equal(401);
                            pm.expect(response.code).not.to.equal(200);
                        }
                        
                        

                    });
                }
            
            });
    }


    // NEW TESTS FOR ADDITIONAL SCENARIOS

    // 1. Wrong Access Token
    let wrongTokenRequestBody = { ...originalRequestBody };
    let wrongAuthy = "JWT " + "eyJ0segegk";  
    const wrongAuthRequest = {
        
        url : urlTemp,
            body : { mode: 'raw',
                raw: JSON.stringify(wrongTokenRequestBody)
            },
            method: 'POST',
            header: {
                'Org': 'dev',
                'Content-Type': 'application/json',
                'Authorization': wrongAuthy
            }
    };
    pm.sendRequest(wrongAuthRequest, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            pm.test("Response code is 401 for invalid token", () => {
                pm.expect(response.code).to.equal(401);
            });
        }
    });


    // 2. Incorrect Content-Type
    let xmlRequestBody = { ...originalRequestBody };
    const xmlRequest = {
        
        url : urlTemp,
            body : { mode: 'raw',
                raw: JSON.stringify(xmlRequestBody)
            },
            method: 'POST',
            header: {
                'Org': 'dev',
                'Content-Type': 'application/xml',
                'Authorization': authy
            }
    };
    pm.sendRequest(xmlRequest, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            pm.test("Response code is 415 for unsupported Content-Type", () => {
                pm.expect(response.code).to.equal(415);
            });
        }
    });

    // 3. Incorrect Method

    const changeMethod = (method) => {
        switch (method) {
            case "POST":
                return "GET";  
            case "GET":
                return "POST";  
            case "DELETE":
                return "PATCH";  
            
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    };
    let methodRequestBody = { ...originalRequestBody };
    const alteredMethod = changeMethod(pm.request.method);
    const alteredMethodRequest = {
        
        url : urlTemp,
            body : { mode: 'raw',
                raw: JSON.stringify(methodRequestBody)
            },
            method: alteredMethod,
            header: {
                'Org': 'dev',
                'Content-Type': 'application/json',
                'Authorization': authy
            }
    };
    pm.sendRequest(alteredMethodRequest, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            pm.test("Response code is 405 for incorrect method", () => {
                pm.expect(response.code).to.equal(405);
            });
        }
    });
}

else {

    

// NEW TESTS FOR ADDITIONAL SCENARIOS

    // 1. Wrong Access Token
    let wrongAuthy = "JWT " + "eyJ0segegk";  
    const wrongAuthRequest = {
        
        url : urlTemp,
        
            method: meth,
            header: {
                'Org': 'dev',
                'Content-Type': 'application/json',
                'Authorization': wrongAuthy
            }
    };
    pm.sendRequest(wrongAuthRequest, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            pm.test("Response code is 401 for invalid token", () => {
                pm.expect(response.code).to.equal(401);
            });
        }
    });


    
    // 2. Incorrect Method

    const changeMethod = (method) => {
        switch (method) {
            case "POST":
                return "GET";  
            case "GET":
                return "POST";  
            case "DELETE":
                return "PATCH";  
            
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    };

    const alteredMethod = changeMethod(meth);
    const alteredMethodRequest = {
        
        url : urlTemp,
            
        method: alteredMethod,
        header: {
            'Org': 'dev',
            'Content-Type': 'application/json',
            'Authorization': authy
        }
    };
    pm.sendRequest(alteredMethodRequest, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            pm.test("Response code is 405 for incorrect method", () => {
                pm.expect(response.code).to.equal(405);
            });
        }
    });

}


