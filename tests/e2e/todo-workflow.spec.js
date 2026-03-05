/*jslint browser, indent: 4, maxlen: 180 */
const { expect, test } = require("@playwright/test");

const { TodoPage } = require("./pages/TodoPage");

test.describe("Todo Workflow", () => {
    /** @type {TodoPage} */
    let todoPage;

    test.beforeEach(async ({ page }) => {
        todoPage = new TodoPage(page);
        await todoPage.goto();
    });

    test("should display the app header", async ({ page }) => {
        await expect(page.getByRole("heading", { name: /to do app/i })).toBeVisible();
        await expect(page.getByText(/keep track of your tasks/i)).toBeVisible();
    });

    test("should add a new task with a due date", async ({ page }) => {
        const taskName = `E2E Task ${Date.now()}`;
        await todoPage.addTask(taskName, "2026-12-31");

        await expect(page.getByText(taskName)).toBeVisible();
        await expect(page.getByText(/due: 2026-12-31/i)).toBeVisible();
    });

    test("should edit an existing task", async ({ page }) => {
        const taskName = `Edit Me ${Date.now()}`;
        const updatedName = `Edited ${Date.now()}`;

        await todoPage.addTask(taskName);
        await todoPage.editTask(taskName, updatedName, "2026-09-15");

        await expect(page.getByText(updatedName)).toBeVisible();
        await expect(page.getByText(/due: 2026-09-15/i)).toBeVisible();
        await expect(page.getByText(taskName, { exact: true })).not.toBeVisible();
    });

    test("should delete a task", async ({ page }) => {
        const taskName = `Delete Me ${Date.now()}`;

        await todoPage.addTask(taskName);
        await expect(page.getByText(taskName)).toBeVisible();

        await todoPage.deleteTask(taskName);

        await expect(page.getByText(taskName, { exact: true })).not.toBeVisible();
    });

    test("should sort tasks by due date", async ({ page }) => {
        const laterTask = `Later ${Date.now()}`;
        const earlierTask = `Earlier ${Date.now()}`;

        await todoPage.addTask(laterTask, "2027-06-30");
        await todoPage.addTask(earlierTask, "2026-01-15");

        await todoPage.toggleSortByDueDate();

        await expect(page.getByRole("button", { name: /sorted by due date/i })).toBeVisible();

        const items = page.locator("ul li");
        const allItems = await items.allTextContents();
        const laterIndex = allItems.findIndex((t) => t.includes(laterTask));
        const earlierIndex = allItems.findIndex((t) => t.includes(earlierTask));
        expect(earlierIndex).toBeLessThan(laterIndex);
    });

    test("should cancel editing a task without saving", async ({ page }) => {
        const taskName = `Cancel Edit ${Date.now()}`;

        await todoPage.addTask(taskName);
        await page.getByRole("button", { name: new RegExp(`edit task ${taskName}`, "i") }).click();

        const editInput = page.getByLabel("Edit task name");
        await editInput.clear();
        await editInput.fill("Should Not Save");

        await page.getByRole("button", { name: /cancel edit/i }).click();

        await expect(page.getByText(taskName)).toBeVisible();
        await expect(page.getByText("Should Not Save", { exact: true })).not.toBeVisible();
    });
});
