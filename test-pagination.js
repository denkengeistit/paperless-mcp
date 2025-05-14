#!/usr/bin/env node
import { PaperlessAPI } from './src/api/PaperlessAPI.js';

async function testPagination() {
  // Initialize the API client with your credentials
  const api = new PaperlessAPI('http://100.109.103.56:8080', 'a1d28961235626c8ee3de239f62fa1b820396af8');
  
  console.log('Testing pagination for tags with field filtering...');
  
  try {
    // Get full tag data for comparison
    console.log('\n--- FETCHING FULL TAG DATA ---');
    console.time('Full data fetch');
    const fullTagsResponse = await api.getTags();
    console.timeEnd('Full data fetch');
    
    // Calculate the size of the full response
    const fullResponseSize = JSON.stringify(fullTagsResponse).length;
    console.log(`Full response size: ${fullResponseSize} bytes`);
    console.log(`Retrieved ${fullTagsResponse.count} tags in total`);
    console.log(`Sample tag data:`, JSON.stringify(fullTagsResponse.results[0], null, 2).substring(0, 500) + '...');
    
    // Now get only id, name, and document_count fields
    console.log('\n--- FETCHING FILTERED TAG DATA ---');
    console.time('Filtered data fetch');
    const filteredTagsResponse = await api.getTags(['id', 'name', 'document_count']);
    console.timeEnd('Filtered data fetch');
    
    // Calculate the size of the filtered response
    const filteredResponseSize = JSON.stringify(filteredTagsResponse).length;
    console.log(`Filtered response size: ${filteredResponseSize} bytes`);
    console.log(`Retrieved ${filteredTagsResponse.count} tags in total`);
    console.log(`Sample filtered tag data:`, filteredTagsResponse.results[0]);
    
    // Calculate reduction percentage
    const reductionPercentage = ((fullResponseSize - filteredResponseSize) / fullResponseSize * 100).toFixed(2);
    console.log(`\nData reduction: ${reductionPercentage}% (${fullResponseSize - filteredResponseSize} bytes saved)`);
    
    // Verify we got the same number of tags with filtering
    if (filteredTagsResponse.results.length === fullTagsResponse.results.length) {
      console.log('FIELD FILTERING WORKING: Retrieved same number of tags with fewer fields!');
    } else {
      console.log('FIELD FILTERING ISSUE: Retrieved different number of tags with filtering');
    }
    
  } catch (error) {
    console.error('Error testing pagination and filtering:', error);
  }
}

// Run the test
testPagination();
