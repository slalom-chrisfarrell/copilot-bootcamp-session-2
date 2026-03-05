/*jslint browser, indent: 4, maxlen: 180 */

/**
 * Page Object Model for the Todo App.
 */
class TodoPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.taskNameInput = page.getByLabel("Task name");
        this.dueDateInput = page.getByLabel("Due date").first();
        this.addTaskButton = page.getByRole("button", { name: /add task/i });
        this.sortButton = page.getByRole("button", { name: /sort by due date|sorted by due date/i });
    }

    /**
     * @returns {Promise<void>}
     */
    async goto() {
        await this.page.goto("/");
        await this.page.waitForLoadState("networkidle");
    }

    /**
     * @param {string} name
     * @param {string} [dueDate]
     * @returns {Promise<void>}
     */
    async addTask(name, dueDate) {
        await this.taskNameInput.fill(name);
        if (dueDate) {
            await this.dueDateInput.fill(dueDate);
        }
        await this.addTaskButton.click();
        await this.page.waitForResponse((resp) => resp.url().includes("/api/items") && resp.request().method() === "POST");
    }

    /**
     * @param {string} taskName
     * @returns {Promise<void>}
     */
    async deleteTask(taskName) {
        await this.page.getByRole("button", { name: new RegExp(`delete task ${taskName}`, "i") }).click();
        await this.page.waitForResponse((resp) => resp.url().includes("/api/items") && resp.request().method() === "DELETE");
    }

    /**
     * @param {string} taskName
     * @param {string} newName
     * @param {string} [newDueDate]
     * @returns {Promise<void>}
     */
    async editTask(taskName, newName, newDueDate) {
        await this.page.getByRole("button", { name: new RegExp(`edit task ${taskName}`, "i") }).click();
        const editInput = this.page.getByLabel("Edit task name");
        await editInput.clear();
        await editInput.fill(newName);
        if (newDueDate) {
            await this.page.getByLabel("Edit due date").fill(newDueDate);
        }
        await this.page.getByRole("button", { name: /save task/i }).click();
        await this.page.waitForResponse((resp) => resp.url().includes("/api/items") && resp.request().method() === "PUT");
    }

    /**
     * @returns {Promise<void>}
     */
    async toggleSortByDueDate() {
        await this.sortButton.click();
        await this.page.waitForResponse((resp) => resp.url().includes("/api/items") && resp.request().method() === "GET");
    }

    /**
     * @param {string} taskName
     * @returns {Promise<boolean>}
     */
    async isTaskVisible(taskName) {
        return this.page.getByText(taskName, { exact: true }).isVisible();
    }
}

module.exports = { TodoPage };
