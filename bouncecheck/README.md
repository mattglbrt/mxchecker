
# Email Domain Validation Script

This script processes a list of email addresses from a CSV file, checks the validity of their domains, and generates reports on invalid domains. It also identifies disposable email domains and provides periodic status updates during execution.

## Features
- Checks MX records to determine if a domain is valid and can receive emails.
- Identifies and flags disposable email domains.
- Generates three output files:
  - `invalid_domains.csv`: Contains a list of all invalid domains along with their error details.
  - `unique_invalid_domains.csv`: Contains a list of unique invalid domains with no additional details.
  - Status updates are provided periodically in the console during the script's execution.

## Requirements

- Node.js (v12 or higher)
- The following Node.js packages:
  - `papaparse`: For parsing CSV files.
  - `p-limit`: For limiting the concurrency of DNS checks.
  - `fs`: For file system operations (built-in module).
  - `dns`: For DNS operations (built-in module).

## Setup

1. **Clone the Repository**: 
   - Download the script files or clone the repository to your local machine.

2. **Install Dependencies**:
   - Ensure you have Node.js installed. Then, install the necessary packages by running:
     ```
     npm install papaparse p-limit
     ```

3. **Prepare the CSV File**:
   - Ensure your CSV file has a column labeled `email` with the list of email addresses you want to validate.
   - The script expects the input CSV file to be named `emails.csv`, but you can modify the `csvFilePath` variable in the script to point to a different file.

4. **Run the Script**:
   - Execute the script using Node.js:
     ```
     node script.mjs
     ```

5. **Outputs**:
   - The script generates the following output files:
     - `invalid_domains.csv`: Contains invalid domains with details.
     - `unique_invalid_domains.csv`: Contains a list of unique invalid domains only.

## Customization

- You can adjust the frequency of status updates by modifying the following line in the script:
  ```javascript
  if (checkedCount % 10 === 0) {
      console.log(`Checked ${checkedCount} out of ${domains.length} domains...`);
  }
  ```
  Change `10` to a different number to adjust the frequency.

- Modify the `disposableDomains` list in the script to add or remove known disposable email domains.

## License

This script is free to use and modify. No warranty is provided.

## Contact

If you encounter any issues or have questions, feel free to reach out.
