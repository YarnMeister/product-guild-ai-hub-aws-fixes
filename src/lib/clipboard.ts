/**
 * Copy text to clipboard with fallback for non-HTTPS environments
 * 
 * Tries to use the modern Clipboard API first, falls back to execCommand
 * if the Clipboard API is not available (e.g., in non-HTTPS contexts)
 * 
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves when copy is successful
 * @throws Error if both methods fail
 */
export async function copyToClipboard(text: string): Promise<void> {
  // Try modern Clipboard API first (works in HTTPS and localhost)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
      // Fall through to fallback method
    }
  }

  // Fallback for non-HTTPS environments
  try {
    // Create temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make it invisible but accessible
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // Select the text
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    // Execute copy command
    const successful = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
    
    if (!successful) {
      throw new Error('execCommand copy failed');
    }
  } catch (error) {
    console.error('Fallback copy method failed:', error);
    throw new Error('Failed to copy to clipboard');
  }
}

