"use strict";

const { NFC, KEY_TYPE_A, TAG_ISO_14443_3, TAG_ISO_14443_4 } = require('nfc-pcsc');

const nfc = new NFC();

nfc.on('reader', reader => {
    console.log(`${reader.reader.name} device attached`);

    // Désactiver le traitement automatique
    reader.autoProcessing = false;

    reader.on('card', async card => {
        console.log();
        console.log(`Card detected:`, card);

        await mainMenu(reader, card);
    });

    reader.on('card.off', card => {
        console.log(`${reader.reader.name} card removed`, card);
    });

    reader.on('error', err => {
        console.log(`${reader.reader.name} an error occurred`, err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name} device removed`);
    });
});

nfc.on('error', err => {
    console.log('an error occurred', err);
});

async function mainMenu(reader, card) {
    const inquirer = await import('inquirer');
    const { action } = await inquirer.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: ['Déposer', 'Retirer', 'Acheter', 'Reset'],
        }
    ]);

    switch (action) {
        case 'Déposer':
            await handleDeposit(reader, card);
            break;
        case 'Retirer':
            await handleWithdraw(reader, card);
            break;
        case 'Acheter':
            await handlePurchase(reader, card);
            break;
        case 'Reset':
            await handleReset(reader, card);
            break;
    }
}

async function handleDeposit(reader, card) {
    const inquirer = await import('inquirer');
    const amount = await promptAmount(inquirer, 'Enter the amount to deposit (in cents):');
    await updateBalance(reader, card, amount);
}

async function handleWithdraw(reader, card) {
    const inquirer = await import('inquirer');
    const amount = await promptAmount(inquirer, 'Enter the amount to withdraw (in cents):');
    await updateBalance(reader, card, -amount);
}

async function handlePurchase(reader, card) {
    const inquirer = await import('inquirer');
    const { item } = await inquirer.default.prompt([
        {
            type: 'list',
            name: 'item',
            message: 'Choose an item to purchase:',
            choices: [
                { name: 'Sandwich (3 EUR)', value: 300 },
                { name: 'Salad (4 EUR)', value: 400 },
                { name: 'Juice (1.5 EUR)', value: 150 },
            ],
        }
    ]);
    await updateBalance(reader, card, -item);
}

async function handleReset(reader, card) {
    await updateBalance(reader, card, -Infinity); // Set balance to 0
}

async function promptAmount(inquirer, message) {
    const { amount } = await inquirer.default.prompt([
        {
            type: 'input',
            name: 'amount',
            message: message,
            validate: value => {
                const valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        }
    ]);

    return amount;
}

async function updateBalance(reader, card, amount) {
    const blockNumber = 4; // Block number to read/write balance
    try {
        console.log(`Trying to authenticate block ${blockNumber}`);
        await reader.authenticate(blockNumber, KEY_TYPE_A, 'FFFFFFFFFFFF');
        console.log(`Authentication succeeded for MIFARE card on block ${blockNumber}.`);

        console.log(`Reading balance from block ${blockNumber}`);
        const data = await reader.read(blockNumber, 16);
        const balance = data.readInt32BE(0);
        console.log(`Current balance from block ${blockNumber}: ${balance / 100} EUR`);

        let newBalance = amount === -Infinity ? 0 : balance + amount;
        if (newBalance < 0) newBalance = 0;
        console.log(`New balance after update on block ${blockNumber}: ${newBalance / 100} EUR`);

        const dataToWrite = Buffer.allocUnsafe(16);
        dataToWrite.writeInt32BE(newBalance, 0);

        try {
            console.log(`Writing new balance to block ${blockNumber}`);
            await reader.write(blockNumber, dataToWrite, 16);
            console.log(`Balance updated on block ${blockNumber}.`);
        } catch (writeError) {
            console.error(`Error during write operation on block ${blockNumber}`, writeError);
        }
    } catch (err) {
        console.error(`Error during authentication or read/write on block ${blockNumber}`, err);
    }
}
