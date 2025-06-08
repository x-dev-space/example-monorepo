// shopping-cart.spec.js
import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the shopping cart page
    await page.goto('http://localhost:4200'); // Update with your actual URL
  });

  test('should display all cart items with correct information', async ({ page }) => {
    // Test that the shopping cart header is visible
    await expect(page.locator('h2:has-text("Shopping Cart")')).toBeVisible();
    
    // Verify all 5 products are displayed
    const productRows = page.locator('[class*="grid-cols-12"][class*="items-center"]');
    await expect(productRows).toHaveCount(5);
    
    // Check first product details
    const firstProduct = productRows.first();
    await expect(firstProduct.locator('text=Samsung Galaxy S23 Ultra S918B/DS 256GB')).toBeVisible();
    await expect(firstProduct.locator('text=Color: Phantom Black')).toBeVisible();
    await expect(firstProduct.locator('text=$2099.98')).toBeVisible(); // 2 * $1049.99
    
    // Verify order summary is displayed
    await expect(page.locator('h3:has-text("Order Summary")')).toBeVisible();
    await expect(page.locator('text=Delivery')).toBeVisible();
    await expect(page.locator('text=$29.99')).toBeVisible();
    await expect(page.locator('text=Tax')).toBeVisible();
    await expect(page.locator('text=$39.99')).toBeVisible();
    
    // Verify total is calculated correctly
    await expect(page.locator('text=$2929.92')).toBeVisible();
  });


  test('should handle item removal and coupon application', async ({ page }) => {
    // Count initial items
    const initialItemCount = await page.locator('[class*="grid-cols-12"][class*="items-center"]').count();
    expect(initialItemCount).toBe(5);
    
    // Remove the first item (Samsung Galaxy)
    const firstTrashButton = page.locator('button:has(svg[class*="w-5 h-5"])').first();
    await firstTrashButton.click();
    
    // Verify item count decreased
    const afterRemovalCount = await page.locator('[class*="grid-cols-12"][class*="items-center"]').count();
    expect(afterRemovalCount).toBe(4);
    
    // Verify Samsung product is no longer visible
    await expect(page.locator('text=Samsung Galaxy S23 Ultra')).not.toBeVisible();
    
    // Test coupon code input
    const couponInput = page.locator('input[placeholder="Enter Your Coupon Code"]');
    await couponInput.fill('TESTCODE20');
    await expect(couponInput).toHaveValue('TESTCODE20');
    
    // Click Apply Coupon button
    const applyCouponButton = page.locator('button:has-text("Apply Your Coupon")');
    await applyCouponButton.click();
    
    // Test checkout button
    const checkoutButton = page.locator('button:has-text("Check Out")');
    await expect(checkoutButton).toBeVisible();
    await expect(checkoutButton).toBeEnabled();
    await checkoutButton.click();
    
    // Test cancel order button
    const cancelButton = page.locator('button:has-text("Cancel Order")');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
  });

  test('should navigate header links and select payment methods', async ({ page }) => {
    // Test header navigation links
    const homeLink = page.locator('a:has-text("Home")');
    const categoriesLink = page.locator('a:has-text("Categories")');
    const aboutLink = page.locator('a:has-text("About Us")');
    const contactLink = page.locator('a:has-text("Contact Us")');
    
    await expect(homeLink).toBeVisible();
    await expect(categoriesLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
    await expect(contactLink).toBeVisible();
    
    // Test My Dashboard button
    const dashboardButton = page.locator('button:has-text("My Dashboard")');
    await expect(dashboardButton).toBeVisible();
    await dashboardButton.click();
    
    // Test payment method selection
    const paymentMethods = page.locator('h3:has-text("Payment Method")').locator('xpath=following-sibling::div//div[contains(@class, "border")]');
    await expect(paymentMethods).toHaveCount(4);
    
    // Click on each payment method
    const firstPaymentMethod = paymentMethods.first();
    await firstPaymentMethod.click();
    
    // Verify it can be selected (you might want to add a selected state in your app)
    await expect(firstPaymentMethod).toHaveClass(/hover:border-blue-500/);
    
    // Test back button
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeVisible();
    await backButton.click();
  });
});

// Additional test for edge cases
test.describe('Shopping Cart Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('should maintain minimum quantity of 1', async ({ page }) => {
    // Find a product with quantity 1
    const jblRow = page.locator('text=JBL Charge 3').locator('xpath=ancestor::div[contains(@class, "grid-cols-12")]');
    const minusButton = jblRow.locator('button:has(svg)').first();
    const quantityDisplay = jblRow.locator('span[class*="text-center"]');
    
    // Verify initial quantity is 1
    await expect(quantityDisplay).toHaveText('1');
    
    // Try to decrease below 1
    await minusButton.click();
    
    // Quantity should still be 1
    await expect(quantityDisplay).toHaveText('1');
  });

  test('should handle empty cart state', async ({ page }) => {
    // Remove all items
    const trashButtons = page.locator('button:has(svg[class*="w-5 h-5"])');
    const buttonCount = await trashButtons.count();
    
    // Remove all items one by one
    for (let i = buttonCount - 1; i >= 0; i--) {
      await trashButtons.nth(i).click();
      await page.waitForTimeout(100); // Small delay to ensure DOM updates
    }
    
    // Verify no items remain
    const remainingItems = await page.locator('[class*="grid-cols-12"][class*="items-center"]').count();
    expect(remainingItems).toBe(0);
  });
});