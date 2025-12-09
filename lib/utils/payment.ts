/**
 * Remove Vietnamese tones from string
 */
export function removeVietnameseTones(str: string): string {
    if (!str) return '';

    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toUpperCase();
}

/**
 * Generate VietQR payment QR code URL
 * @param bankCode - Bank code (e.g., "VCB", "TCB", "MB")
 * @param accountNumber - Bank account number
 * @param amount - Payment amount
 * @param billId - Bill ID for payment reference
 * @returns QR code image URL
 */
export function generatePaymentQR(
    bankCode: string,
    accountNumber: string,
    amount: number,
    billId: string
): string {
    // Shorten billId to last 8 characters for QR content
    const shortId = billId.slice(-8).toUpperCase();
    const content = `HD ${shortId}`;
    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}`;
}

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}
