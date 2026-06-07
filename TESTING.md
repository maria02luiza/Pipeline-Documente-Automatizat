# Testing Report

## Project

Automated Invoice Processing Pipeline

## Tester
Teodora Fleaca

## Test Case 1 - Valid Invoice Image

**File:** M2.jpeg

**Objective:** Verify that the application can process a valid invoice image.

**Expected Result:** Invoice data is extracted correctly.

**Actual Result:** The invoice was processed successfully and the application extracted the invoice information.

**Status:** PASSED

## Test Case 2 - Password Protected PDF

**Objective:** Verify that the application handles password-protected PDF files correctly.

**Input:** Invoice PDF protected with a password.

**Expected Result:** The application should reject the file and display an appropriate error message without crashing.

**Actual Result:** The application displayed the message: "Processing Failed: The document is password-protected or corrupted. Please upload a valid file."

**Status:** PASSED

## Test Case 3 - Corrupted PDF File

**File:** Corrupted PDF (modified via Notepad)

**Objective:** Verify that the application handles corrupted or invalid PDF files correctly.

**Expected Result:** The application should detect the corrupted file and reject it gracefully with an appropriate error message, without crashing.

**Actual Result:** The application displayed the message: "Procesare Eșuată: PDF corupt sau invalid."

**Status:** PASSED

## Test Case 4 - Non-Invoice Image

**File:** Personal photo (face image)

**Objective:** Verify that the application correctly handles images that do not contain invoice data.

**Expected Result:** The application should either reject the file as invalid input or clearly indicate that no invoice data was detected, without attempting to extract structured invoice fields.

**Actual Result:** The application did not return an error. Instead, it attempted to process the image as an invoice and generated empty/default invoice fields (e.g. "Nedetectat", "0,00") under a fake invoice structure.

**Status:** FAILED

**Notes:** The system incorrectly assumes that any image input is an invoice and forces structured extraction even when no invoice content exists. This leads to misleading results instead of proper validation or fallback handling.

## Test Case 5 - Valid PDF Invoice

**File:** Valid invoice PDF

**Objective:** Verify that the application correctly processes a valid PDF invoice and extracts all relevant fields.

**Expected Result:** The application should successfully extract invoice data such as:
- Supplier name
- Invoice number
- Date
- Total amount
- VAT (if available)

**Actual Result:** The application successfully processed the PDF and extracted all available invoice fields correctly.

**Status:** PASSED

## Test Case 6 - Non-Invoice PDF

**File:** Non-invoice PDF (legal/criminal record document)

**Objective:** Verify that the system does not incorrectly interpret non-invoice PDF documents as invoices.

**Expected Result:** The application should detect that the document is not an invoice and either:
- reject the file with a clear message ("No invoice detected"), or
- avoid extracting structured invoice fields.

**Actual Result:** The system incorrectly interpreted the document as an invoice and extracted fabricated invoice data, including:
- "Furnizor: Inspectoratul de politie al judetului Sibiu"
- "Număr Factură: 48614097"
- "Total de Plată: 0,00"

**Status:** FAILED

**Notes:** The model is hallucinating invoice structure from unrelated document types instead of validating document type before extraction. This indicates missing document classification or filtering step in the pipeline.

## Test Case 7 - Incomplete Invoice

**File:** Invoice image/PDF missing key fields (incomplete invoice)

**Objective:** Verify how the system handles invoices with missing or partially visible data.

**Expected Result:** The application should:
- extract available fields correctly
- mark missing fields as "Nedetectat"
- avoid filling missing fields with incorrect or guessed values

**Actual Result:** The system extracted some fields correctly, but others were incorrect or partially inferred, leading to inaccurate data in the output.

**Status:** FAILED

**Notes:** The system does not clearly distinguish between missing data and incorrectly inferred data. This leads to unreliable extraction results in incomplete documents.

## Test Case 8 - Low Quality Invoice Image

**File:** Blurred / low-resolution invoice image

**Objective:** Verify the system's ability to extract data from low-quality or partially unreadable invoice images.

**Expected Result:** The application should either:
- extract partial data correctly where possible, or
- indicate reduced confidence / missing fields, without fabricating incorrect values.

**Actual Result:** The system successfully extracted invoice data correctly despite low image quality.

**Status:** PASSED

## Test Case 9 - Multi-page PDF Invoice

**File:** PDF containing 3 invoices on separate pages

**Objective:** Verify how the system handles multi-page PDF documents containing multiple invoices.

**Expected Result:** The application should either:
- process all pages and extract data from each invoice separately, or
- clearly indicate that multiple invoices were detected and handle them individually.

**Actual Result:** The system processed only the first page and extracted data from the first invoice only, ignoring the remaining pages.

**Status:** FAILED

**Notes:** The pipeline does not support multi-page invoice extraction. It appears to stop processing after the first detected invoice, which leads to incomplete data extraction when multiple invoices are present in the same document.