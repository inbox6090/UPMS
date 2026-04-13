# Smart UDC Management System Setup Guide

This guide explains how to set up the serverless backend using Google Sheets and Google Apps Script.

## Step 1: Prepare the Google Sheet
1. Open Google Sheets and create a new spreadsheet named **"Smart UDC Database"**.
2. Create the following four sheets (tabs) EXACTLY with these names:
   - `Citizens`
   - `Applications`
   - `Users`
   - `Logs`
3. In the `Users` sheet, add the following columns in Row 1: `Email`, `Password`, `Role`.
4. Add the default users in Row 2 and Row 3:
   - `Baheratailunion@gmail.com` | `482300` | `Chairman`
   - `inbox6090@gmail.com` | `482300` | `Operator`

## Step 2: Set up Google Apps Script (code.gs)
1. In your Google Sheet, click on **Extensions > Apps Script**.
2. Delete any existing code in `Code.gs`.
3. Copy the contents of the `backend/code.gs` file from this project and paste it into the Apps Script editor.
4. Replace the `SPREADSHEET_ID` variable at the top of the script with your actual spreadsheet ID. 
   *(You can find the ID in your Google Sheet URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID_IS_HERE]/edit`)*
5. Click the **Save** (floppy disk) icon.

## Step 3: Deploy as a Web App
1. Click on the **Deploy** button at the top right of the Apps Script editor, and select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set the following options:
   - Description: `Production API`
   - Execute as: **Me ([Your Email])**
   - Who has access: **Anyone**
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize access**, select your account, click **Advanced**, and then click **Go to [Project Name] (unsafe)** to allow it to read/write to your Sheet.
6. Copy the **Web app URL** that is generated.

## Step 4: Connect the Frontend
1. Open `app/js/api.js` in your project folder.
2. Locate the line: `const SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';`
3. Replace `'YOUR_WEB_APP_URL_HERE'` with the Web app URL you copied in Step 3.

## Step 5: PWA Installation (Windows / Android)
1. Host the project files (e.g., on GitHub Pages, Vercel, or a local server).
2. Open `index.html` in Chrome or Edge.
3. You will see an "Install App" icon in the URL bar (on Desktop) or a prompt at the bottom of the screen (on Mobile). Click it to install the application locally.
