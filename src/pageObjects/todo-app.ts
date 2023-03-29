import { expect, Page, Locator } from '@playwright/test';

// Create a class in typescript called Todo 
export class TodoApp {
    readonly clearCompleted: Locator;
    readonly filterActive: Locator;
    readonly filterCompleted: Locator;
    readonly newTodo: Locator;
    readonly page: Page;
    readonly todoCheckbox: Locator;
    readonly todoDelete: Locator;
    readonly todoInputEdit: Locator;
    readonly todoText: Locator;
    readonly todoToggle: Locator;
    readonly toggleAll: Locator;    

    constructor(page: Page) {
        this.clearCompleted = page.locator('button.clear-completed');
        this.filterActive = page.locator('a[href="#/active"]');
        this.filterCompleted = page.locator('a[href="#/completed"]');
        this.newTodo = page.getByPlaceholder('What needs to be done?');
        this.page = page;
        this.todoCheckbox = page.getByTestId('todo-item');
        this.todoDelete = page.locator('button.destroy');
        this.todoInputEdit = page.locator('input.edit');
        this.todoText = page.getByTestId('todo-title');
        this.todoToggle = page.locator('.toggle');
        this.toggleAll = page.getByLabel('Mark all as complete');
    };
    
    TODO_ITEMS = [
        'complete code challenge for reach',
        'ensure coverage for all items is automated',
        'third todo item'
      ];

    // Create a method for adding Todos
    async addTodo(todo: string[], nth: number) {
        await this.newTodo.fill(todo[nth]);
        await this.newTodo.press('Enter');
    };

    // Create a method to add all todos from TODO_ITEMS array
    async addAllTodos() {
        // iterate over each todo item in TODO_ITEMS and create a new todo
    for (let i = 0; i < this.TODO_ITEMS.length; i++) {
        await this.addTodo(this.TODO_ITEMS, i);
      };
    };

     // Create a method to get Todos in local storage
     async checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
        return await page.waitForFunction(e => {
            return JSON.parse(localStorage['react-todos']).length === e;
        }, expected);
    };

    // Create a method to get completed Todos in local storage
    async checkNumberOfCompletedTodosInLocalStorage(page: Page, expected: number) {
        return await page.waitForFunction(e => {
            return JSON.parse(localStorage['react-todos']).filter((todo: any) => todo.completed).length === e;
        }, expected);
    };

    // Create a method to get Todos in local storage
    async checkTodosInLocalStorage(page: Page, title: string) {
        return await page.waitForFunction(t => {
            return JSON.parse(localStorage['react-todos']).map((todo: any) => todo.title).includes(t);
        }, title);
    };

    // Create a method to complete all todos
    async completeAllTodos() {
        return await this.toggleAll.click();
    };

    // Create a method to get Todos
    async getTodo() {
        return this.page.textContent('data-testid=todo');
    };

    // Create a method to check all todos are completed
    async verifyAllTodosAreCompleted() {
        const completedTodosCount = await this.todoCheckbox.count();
       for (let i = 0; i < completedTodosCount; i++) {
         await expect(this.todoCheckbox.nth(i)).toHaveClass('completed');
       };
    };
};
