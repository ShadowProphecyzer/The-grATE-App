const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FDA_CODE = '10-3-11523-5-0460';
const OUTPUT_FILE = 'oryor_product_info.txt';
const ERROR_SCREENSHOT = 'error_screenshot.png';

async function checkProduct() {
  let browser;
  
  try {
    console.log('Starting FDA product lookup...');
    
    // Launch browser with better options
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    console.log('Navigating to FDA lookup page...');
    
    // Step 1: Navigate to the page
    await page.goto('https://oryor.com/check-product-serial', {
      waitUntil: 'networkidle2',
      timeout: 30000 // Reduced timeout
    });

    console.log('Page loaded, filling form...');
    
    // Step 2: Fill and submit the form
    await page.waitForSelector('input[name="serial"]', { timeout: 10000 });
    await page.type('input[name="serial"]', FDA_CODE);
    
    // Wait a moment before clicking submit
    await page.waitForTimeout(1000);
    
    // Try different submit button selectors
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Submit")',
      'button:contains("Search")',
      'form button',
      'form input[type="submit"]'
    ];
    
    let submitClicked = false;
    for (const selector of submitSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        submitClicked = true;
        console.log(`Clicked submit button with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!submitClicked) {
      throw new Error('Could not find submit button');
    }
    
    console.log('Form submitted, waiting for results...');
    
    // Step 3: Wait for results with multiple possible selectors
    const resultSelectors = [
      '.product-info',
      '.product-details',
      '.result',
      '.search-result',
      'div[class*="product"]',
      'div[class*="result"]'
    ];
    
    let resultsFound = false;
    for (const selector of resultSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        resultsFound = true;
        console.log(`Found results with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!resultsFound) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'no_results_found.png' });
      throw new Error('No results found after form submission');
    }

    // Step 4: Extract data with better error handling
    const productInfo = await page.evaluate(() => {
      const result = {
        name: 'Not found',
        manufacturer: 'Not found',
        status: 'Not found',
        ingredients: []
      };
      
      // Try multiple selectors for product name
      const nameSelectors = [
        'div.product-info h2',
        '.product-name',
        'h1',
        'h2',
        'div[class*="name"]',
        'div[class*="title"]'
      ];
      
      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText.trim()) {
          result.name = element.innerText.trim();
          break;
        }
      }
      
      // Extract manufacturer, status, and other details
      const allParagraphs = document.querySelectorAll('p, div');
      for (const element of allParagraphs) {
        const text = element.innerText.trim();
        if (text.includes('ผู้ผลิต') || text.includes('Manufacturer')) {
          result.manufacturer = text.replace(/ผู้ผลิต|Manufacturer/gi, '').replace(':', '').trim();
        } else if (text.includes('สถานะ') || text.includes('Status')) {
          result.status = text.replace(/สถานะ|Status/gi, '').replace(':', '').trim();
        }
      }
      
      // Extract ingredients
      const ingredientSelectors = [
        'div.ingredients ul li',
        '.ingredients li',
        'ul li',
        'div[class*="ingredient"] li'
      ];
      
      for (const selector of ingredientSelectors) {
        const ingredients = document.querySelectorAll(selector);
        if (ingredients.length > 0) {
          for (const ingredient of ingredients) {
            const text = ingredient.innerText.trim();
            if (text && !result.ingredients.includes(text)) {
              result.ingredients.push(text);
            }
          }
          break;
        }
      }
      
      return result;
    });

    console.log('Data extracted successfully');

    // Step 5: Save to file
    let outputText = `Thai FDA Product Information\n`;
    outputText += `===========================\n`;
    outputText += `Product Code: ${FDA_CODE}\n`;
    outputText += `Product Name: ${productInfo.name}\n`;
    outputText += `Manufacturer: ${productInfo.manufacturer}\n`;
    outputText += `Status: ${productInfo.status}\n`;
    outputText += `Ingredients:\n`;
    
    if (productInfo.ingredients.length > 0) {
      productInfo.ingredients.forEach(ing => {
        outputText += `- ${ing}\n`;
      });
    } else {
      outputText += `No ingredient information available\n`;
    }

    // Add timestamp
    outputText += `\nExtracted on: ${new Date().toISOString()}\n`;

    fs.writeFileSync(OUTPUT_FILE, outputText);
    console.log(`Data saved to ${OUTPUT_FILE}`);
    
    return productInfo;

  } catch (error) {
    console.error('Error during product lookup:', error.message);
    
    // Take error screenshot if browser is available
    if (browser) {
      try {
        const page = (await browser.pages())[0];
        if (page) {
          await page.screenshot({ path: ERROR_SCREENSHOT });
          console.log(`Error screenshot saved to ${ERROR_SCREENSHOT}`);
        }
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError.message);
      }
    }
    
    // Save error details to file
    const errorText = `Error Information\n================\n`;
    errorText += `Error: ${error.message}\n`;
    errorText += `Timestamp: ${new Date().toISOString()}\n`;
    errorText += `FDA Code: ${FDA_CODE}\n`;
    
    fs.writeFileSync('error_log.txt', errorText);
    console.log('Error details saved to error_log.txt');
    
    return null;
    
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

// Run the function with proper error handling
checkProduct().then(result => {
  if (result) {
    console.log('Product lookup completed successfully');
    console.log('Extracted data:', JSON.stringify(result, null, 2));
  } else {
    console.log('Failed to retrieve product information');
  }
}).catch(error => {
  console.error('Unexpected error:', error);
});