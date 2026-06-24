# Coding Task

### Description:
You will have to build a small Vue.js application using a data source as a text file  located on the folder `/api/mocks/products.json` contains a json object with a set of data
The root of the JSON file contains an array of objects called `products`
Each Product has a set of data as name, link, image, price and description.

In the application, it is required to have a form handle the editing product in the provided JSON file. A new product required all the fields except `logoLocation` , `variableDenomPriceMinAmount` , and `variableDenomPriceMaxAmount`. The data from each field should be validated. For example, the only number field will not allow any Alphabet in the input. Please consider if some input fields need to limit the number of characters or not.

### Rules:

- You will have access to the internet and feel free to find anything you need by searching the internet. Attempt to fulfill each of the requirements below in the order specified.
- This is not about speed and it is OK if you cannot finish all requirements in allotted time. However, be sure to organize your code structure accordingly and design/code in a way that is considered a production quality deliverable.
- This is not about how much you can get done in a small amount of time, rather is about producing working, well written code.
- We will not be evaluating your design, but yes how the UX is presented.
- If we can’t run your application we will not able to evaluate your task
- You need to deliver the task to us in a Zip file without the node dependencies

### Requirements:
- VUE.js must be used to create a web app to utilize the provided JSON file
- The products contained in the array need to be displayed with all the information available
- A fully functionally search bar needs to be present at the header
- A detail page for each product
- A form that can handle edit of a product with reasonable validations

### Restrictions:
- You are not allowed to change the product JSON structure
- The application needs to run following your instructions on the Readme.md file
- You will have 1 week to complete the task
- The clock will start when the task is sent
