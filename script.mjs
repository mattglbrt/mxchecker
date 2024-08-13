import fs from 'fs';
import Papa from 'papaparse';
import dns from 'dns/promises';
import pLimit from 'p-limit';

const disposableDomains = [
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "yopmail.com",
    "guerrillamail.com",
    "trashmail.com",
    "fakeinbox.com",
    "maildrop.cc",
    "dispostable.com",
    "spambog.com",
    "sharklasers.com",
    "getairmail.com",
    "throwawaymail.com",
    "temporarymail.com",
    "temp-mail.org",
    "emailsensei.com",
    "burnermail.io",
    "33mail.com",
    "getnada.com",
    "protonmail.com",  // Note: ProtonMail is a legitimate service but often used for anonymity.
    "luxusmail.org",
    "mohmal.com",
    "easytrashmail.com",
    "tmail.com",
    "mailnesia.com",
    "spamgourmet.com",
    "disposablemail.com",
    "mailcatch.com",
    "spam4.me",
    "tempm.com",
    "spamdecoy.net",
    "spaml.de",
    "boun.cr",
    "guerrillamailblock.com",
    "pokemail.net",
    "disposableinbox.com",
    "getonemail.net",
    "dropmail.me",
    "mailbox.org", // Similar note as ProtonMail.
    "anonbox.net",
    "amail.club",
    "mytrashmail.com",
    "trashmail.de",
    "sogetthis.com",
    "fake-mail.net",
    "tempemail.co",
    "bigstring.com",
    "spamobox.com",
    "throwawayemail.com",
    "mailtemp.net",
    "disposableaddress.com",
    "emailondeck.com",
    "one-time.email",
    "emlpro.com",
    "getairmail.com",
    "24hourmail.com",
    "chacuo.net",
    "guerrillamail.biz",
    "zoemail.com",
    "disposableemail.us",
    "temp-mail.io",
    "tempail.com",
    "tempr.email",
    "inboxkitten.com",
    "minutemailbox.com",
    "temp-mails.com",
    "mail-fake.com",
    "fakeemailgenerator.com",
    "mail-temp.com",
    "tempomail.fr",
    "tmail.ws",
    "meltmail.com",
    "tmail.rocks",
    "inboxbear.com",
    "inboxclean.com",
    "relay.firefox.com"  // Firefox's relay service allows users to create temporary, anonymous email addresses.
];

// Function to read and parse the CSV file
function parseCSV(filePath) {
    const file = fs.readFileSync(filePath, 'utf8');
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

// Function to extract domains from email addresses
function extractDomains(emailAddresses) {
    return emailAddresses
        .filter(email => email && email.includes('@'))  // Filter out undefined or invalid email addresses
        .map(email => email.split('@')[1]);             // Extract the domain part
}

// Function to check if the domain is disposable
function isDisposableDomain(domain) {
    return disposableDomains.includes(domain);
}

// Function to check DNS records
async function checkDNS(domain) {
    try {
        const records = await dns.resolveMx(domain);
        if (records && records.length > 0) {
            return { domain, deliverable: true, records };
        } else {
            return { domain, deliverable: false, records: [] };
        }
    } catch (error) {
        return { domain, deliverable: false, error: error.message };
    }
}

// Function to write invalid domains to a CSV file
function writeInvalidDomainsToCSV(invalidDomains, outputFilePath) {
    const csv = Papa.unparse(invalidDomains);
    fs.writeFileSync(outputFilePath, csv);
}

// Function to write unique invalid domains to a separate CSV file
function writeUniqueInvalidDomainsToCSV(invalidDomains, outputFilePath) {
    const uniqueDomains = [...new Set(invalidDomains.map(result => result.domain))];
    const csv = Papa.unparse(uniqueDomains.map(domain => ({ domain })));
    fs.writeFileSync(outputFilePath, csv);
}

// Main function to check email deliverability with concurrency limit and periodic updates
async function checkEmailDeliverability(csvFilePath, outputFilePath, uniqueDomainsOutputFilePath) {
    try {
        const data = await parseCSV(csvFilePath);
        const emailAddresses = data.map(row => row.email); // Adjust the key to match your CSV header
        const domains = extractDomains(emailAddresses);

        const limit = pLimit(10); // Adjust the concurrency limit as needed
        let checkedCount = 0;
        const dnsChecks = await Promise.all(domains.map(async (domain) => {
            if (isDisposableDomain(domain)) {
                return { domain, deliverable: false, error: "Disposable email domain" };
            }
            const result = await limit(() => checkDNS(domain));
            checkedCount++;

            // Provide status update every 10 domains
            if (checkedCount % 10 === 0) {
                console.log(`Checked ${checkedCount} out of ${domains.length} domains...`);
            }

            return result;
        }));

        const invalidDomains = dnsChecks
            .filter(result => !result.deliverable)
            .map(result => ({ domain: result.domain, error: result.error }));

        // Write the invalid domains to a CSV file
        if (invalidDomains.length > 0) {
            writeInvalidDomainsToCSV(invalidDomains, outputFilePath);
            writeUniqueInvalidDomainsToCSV(invalidDomains, uniqueDomainsOutputFilePath);
            console.log(`Invalid domains written to ${outputFilePath}`);
            console.log(`Unique invalid domains written to ${uniqueDomainsOutputFilePath}`);
        } else {
            console.log("All domains have valid MX records and are not disposable.");
        }

        // Output the total number of domains checked
        console.log(`Total domains checked: ${domains.length}`);

    } catch (error) {
        console.error("Error:", error);
    }
}

// Set the file paths for input and output CSVs
const csvFilePath = 'emails.csv'; // Replace with your CSV file path
const outputFilePath = 'invalid_domains.csv'; // Replace with your desired output file path for invalid domains
const uniqueDomainsOutputFilePath = 'unique_invalid_domains.csv'; // Replace with your desired output file path for unique invalid domains

// Run the main function
checkEmailDeliverability(csvFilePath, outputFilePath, uniqueDomainsOutputFilePath);
