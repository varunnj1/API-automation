// Extracting the URL from the request object
var url = request.url.toString();

// Function to check if a string is in kebab case
function isKebabCase(str) {
    return /^[a-z]+(-[a-z]+)*$/.test(str);
}

// Extracting the endpoint from the URL
var endpoint = url.split('?')[0]; // Remove query parameters
endpoint = endpoint.split('#')[0]; // Remove fragment identifiers
endpoint = endpoint.split('/').pop(); // Extract the last part of the URL (endpoint)

// Check if the endpoint is in kebab case
pm.test("URL should be in kebab case", function() {
    pm.expect(isKebabCase(endpoint)).to.be.true;
});

// Check if the request method is GET
if (pm.request.method === "GET") {
    // Check if the request body is empty
    if (pm.request.body && Object.keys(pm.request.body).length > 0) {
        // If body exists for GET request, fail the test
        pm.test("No body for GET request", function() {
            pm.expect.fail("GET requests should not have a request body.");
        });
    }
}

// Function to check if a string is in snake case
function isSnakeCase(str) {
    return /^[a-z]+(?:_[a-z]+)*$/.test(str);
}

// Check request body keys for snake case
pm.test("Request Body keys should be in snake case", function() {
    if (pm.request.body) {
        var bodyKeys = Object.keys(pm.request.body);
        bodyKeys.forEach(function(key) {
            pm.expect(isSnakeCase(key)).to.be.true;
        });
    }
});

// Check response body keys for snake case
pm.test("Response Body keys should be in snake case", function() {
    var responseBody = pm.response.json();
    var responseKeys = Object.keys(responseBody);
    responseKeys.forEach(function(key) {
        pm.expect(isSnakeCase(key)).to.be.true;
    });
});

// Other tests

pm.test("Response has the required fields", function () {
    const responseData = pm.response.json();
    
    pm.expect(responseData).to.be.an('object');
    pm.expect(responseData.task_id).to.exist;
});

pm.test("Task_id is of correct length", function () {
  const responseData = pm.response.json();
  
  pm.expect(responseData.task_id).to.be.a('string').and.to.have.lengthOf.at.least(36, "Task_id should not be empty");
});

pm.test("Response time is within the acceptable range", function () {
  pm.expect(pm.response.responseTime).to.be.below(5000);
});

//SCHEMA TEST FOR SUCCESSFUL REQUESTS 
// Check if the response code is 200
pm.test("Response code is 200", function () {
    pm.response.to.have.status(200);
    
    // If the response code is 200, then test the response schema
    if (pm.response.code === 200) {
        // Parse the response body as JSON
        let responseBody = pm.response.json();
        
        // Check the response schema
        pm.test("Response schema is correct", function () {
            // Check if the response body has the 'task_id' property
            pm.expect(responseBody).to.have.property("task_id");

            // Check if the 'task_id' property is a string
            pm.expect(responseBody.task_id).to.be.a('string');
        });
    }
});

//TEST FOR PRESENCE OF camelCase 
// Test for request body
pm.test("Request body should not contain camelCase keys", function() {
    var requestBody = pm.request.body;
    var requestBodyJson = JSON.parse(requestBody);
    var camelCaseKeys = [];

    // Function to check if a string is in camelCase
    function isCamelCase(str) {
        // Only match camelCase, ignore all lowercase or uppercase
        return /[a-z]+(?:[A-Z][a-z]*)+/.test(str);
    }

    // Find camelCase keys in the request body
    for (var key in requestBodyJson) {
        if (isCamelCase(key)) {
            camelCaseKeys.push(key);
        }
    }

    // Assertion to check if no camelCase keys are found
    pm.expect(camelCaseKeys.length).to.equal(0, "Found camelCase keys in the request body: " + camelCaseKeys.join(", "));
});

// Test for response body
pm.test("Response body should not contain camelCase keys", function() {
    var responseBody = pm.response.json();
    var camelCaseKeys = [];

    // Function to check if a string is in camelCase
    function isCamelCase(str) {
        // Only match camelCase, ignore all lowercase or uppercase
        return /[a-z]+(?:[A-Z][a-z]*)+/.test(str);
    }

    // Find camelCase keys in the response body
    for (var key in responseBody) {
        if (isCamelCase(key)) {
            camelCaseKeys.push(key);
        }
    }

    // Assertion to check if no camelCase keys are found
    pm.expect(camelCaseKeys.length).to.equal(0, "Found camelCase keys in the response body: " + camelCaseKeys.join(", "));
});

