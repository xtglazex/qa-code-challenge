import { test, expect } from '@playwright/test';
import { TodoApp } from '../src/pageObjects/todo-app'



test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
});

test.describe('Create New Todo', () => {
  test('should be able to create new items on the page', async ({ page }) => {
    const todoApp = new TodoApp(page);
  
    // Create 1st todo.
    await todoApp.addTodo(todoApp.TODO_ITEMS, 0);
   
    // Make sure the list only has one todo item.
    await expect(todoApp.todoText).toHaveText([todoApp.TODO_ITEMS[0]]);

    // Create 2nd todo.
    todoApp.addTodo(todoApp.TODO_ITEMS, 1);

    // Make sure the list now has two todo items.
    await expect(todoApp.todoText).toHaveText([
      todoApp.TODO_ITEMS[0],
      todoApp.TODO_ITEMS[1]
    ]);

    await todoApp.checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('submitting a new item should clear the input field', async ({ page }) => {
    const todoApp = new TodoApp(page);
    
    // Create a new todo
    await todoApp.addTodo(todoApp.TODO_ITEMS, 0);
    
    // Ensure input field is empty.
    await expect(todoApp.newTodo).toHaveValue('');
  });

  test('should be able to verify that newest todo is at the bottom of the list', async ({ page }) => {
    const todoApp = new TodoApp(page);
    
    // Create 1st todo.
    await todoApp.addTodo(todoApp.TODO_ITEMS, 1);
    
    // Create 2nd todo.
    await todoApp.addTodo(todoApp.TODO_ITEMS, 0);
    
    // Ensure new todo is at the bottom of the list
    await expect(todoApp.todoText.nth(1)).toHaveText(todoApp.TODO_ITEMS[0]);
  });
});

test.describe('Complete Todos', () => {
  test('should be able to mark a todo as completed', async ({ page }) => {
    const todoApp = new TodoApp(page);
  
    // Iterate over each todo item in TODO_ITEMS and create a new todo
    await todoApp.addAllTodos();

    // Click each todo item to mark as completed and verify the completed class is applied
    for (let i = 0; i < todoApp.TODO_ITEMS.length; i++) {
      await todoApp.todoToggle.nth(i).click();
      await expect(todoApp.todoCheckbox.nth(i)).toHaveClass('completed');
    };
  });

  test('should be able to clear the completed todo state', async ({ page }) => {
    const todoApp = new TodoApp(page);
    
    // Create all todos
    await todoApp.addAllTodos();
    
    // Click to complete all todos
    await todoApp.completeAllTodos();

    // Verify all todo items have the completed class
    await todoApp.verifyAllTodosAreCompleted();
    
    // Click to clear completed todos
    await todoApp.completeAllTodos();

    // Get a count of all todo items with the completed class
    const completedTodosCount = await todoApp.todoCheckbox.count();
    for (let i = 0; i < completedTodosCount; i++) {
      await expect(todoApp.todoCheckbox.nth(i)).not.toHaveClass('completed');
    };
  });

  test('should be able to mark all Todos complete', async ({ page }) => {
    const todoApp = new TodoApp(page);
    
    // Create all todos
    await todoApp.addAllTodos();
    
    // Click to complete all todos
    await todoApp.completeAllTodos();

    // Verify all todo items have the completed class
    await todoApp.verifyAllTodosAreCompleted();
  });
});

test.describe('Edit Existing Todos', () => {
  test('should be able to edit existing todos', async ({ page }) => {
    const todoApp = new TodoApp(page);
  
    // Create all todos
    await todoApp.addAllTodos();

    // Edit each todo item and verify the new text is displayed
    for (let i = 0; i < todoApp.TODO_ITEMS.length; i++) {
      await todoApp.todoText.nth(i).dblclick();
      await todoApp.todoText.nth(i).press('Control+A');
      await todoApp.todoText.nth(i).press('Backspace');
      await todoApp.todoInputEdit.nth(i).fill(`This is new text number ${i}`);
      await todoApp.todoText.nth(i).press('Enter');
    };

    // Verify all todo items have the new text
    for (let i = 0; i < todoApp.TODO_ITEMS.length; i++) {
      await expect(todoApp.todoText.nth(i)).toHaveText(`This is new text number ${i}`);
    };
  });

  test('should be able to edit existing todos and clear the text', async ({ page }) => {
    const todoApp = new TodoApp(page);
    const modifiedToDoItems : string [] = []
    
    // Create all todos
    await todoApp.addAllTodos();
    
    // Edit first todo item clear all text and press enter
    await todoApp.todoText.nth(0).dblclick();
    await todoApp.todoText.nth(0).press('Control+A');
    await todoApp.todoText.nth(0).press('Backspace');
    await todoApp.todoText.nth(0).press('Enter');

    // Get count of all todo items
    const todoCount = await todoApp.todoText.count();

    // Push all todo items into modifiedToDoItems array
    for (let i = 0; i < todoCount; i++) {
      modifiedToDoItems.push(await todoApp.todoText.nth(i).innerText());
    };

    // Expect that modifiedToDoItems array does not contain the first todo item
    expect(modifiedToDoItems).not.toContain(todoApp.TODO_ITEMS[0]);
  });


  test('should be able to cancel editing an existing todo', async ({ page }) => { 
    const todoApp = new TodoApp(page);
    
    // Create all todos
    await todoApp.addAllTodos();

    // Edit each todo item
    for (let i = 0; i < todoApp.TODO_ITEMS.length; i++) {
      await todoApp.todoText.nth(i).dblclick();
      await todoApp.todoText.nth(i).press('Control+A');
      await todoApp.todoText.nth(i).press('Backspace');
      await todoApp.todoInputEdit.nth(i).fill(`This is new text number ${i}`);
      await todoApp.todoText.nth(i).press('Escape');
    };

    // Verify all todo items have the original text
    for (let i = 0; i < todoApp.TODO_ITEMS.length; i++) {
      await expect(todoApp.todoText.nth(i)).toHaveText(todoApp.TODO_ITEMS[i]);
    };
  });
});

test.describe('Miscellaneous Todo functionality', () => {
  test('should validate that buttons are disabled when editing an item', async ({ page }) => {
    const todoApp = new TodoApp(page);
    
    // Create all todos
    await todoApp.addAllTodos();

    // Edit first todo item
    await todoApp.todoText.nth(0).dblclick();

    // Verify that the toggle, and delete buttons are disabled
    await expect(todoApp.todoToggle.nth(0)).not.toBeVisible();
    await expect(todoApp.todoDelete.nth(0)).not.toBeVisible();
  });

  test('should validate that completed todos are filterable', async ({ page }) => {
    const todoApp = new TodoApp(page);
    const completedTodos : string [] = []
    // Create all todos
    await todoApp.addAllTodos();

    // Click to complete first two todos
    await todoApp.todoToggle.nth(0).click();
    await todoApp.todoToggle.nth(1).click();

    // Click on the completed filter
    await todoApp.filterCompleted.click();

    // Get count of all todo items
    const todoCount = await todoApp.todoText.count();

    // Verify all todos have completed class
    for (let i = 0; i < todoCount; i++) {
      await expect(todoApp.todoCheckbox.nth(i)).toHaveClass('completed');
    };

    // Push all current todo items into completedTodos array
    for (let i = 0; i < todoCount; i++) {
      completedTodos.push(await todoApp.todoText.nth(i).innerText());
    };
    
    // Verify that this todo item is not in the completedTodos array
    expect(completedTodos).not.toContain(todoApp.TODO_ITEMS[2]);

    // Verify that completed todos in local stoarge are equal to 2
     await todoApp.checkNumberOfCompletedTodosInLocalStorage(page, 2);
   
  });

  test('should validate that active todos are filterable', async ({ page }) => {
    const todoApp = new TodoApp(page);
    const activeTodos : string [] = []
    
    // Create all todos
    await todoApp.addAllTodos();
    
    // Click to complete first two todos
    await todoApp.todoToggle.nth(0).click();
    await todoApp.todoToggle.nth(1).click();

    // Click on the active filter
    await todoApp.filterActive.click();
    
    // Get count of all todo items
    const todoCount = await todoApp.todoText.count();

    // Verify all todos do not have completed class
    for (let i = 0; i < todoCount; i++) {
      await expect(todoApp.todoCheckbox.nth(i)).not.toHaveClass('completed');
    };

    // Push all current todo items into activeTodos array
    for (let i = 0; i < todoCount; i++) {
      activeTodos.push(await todoApp.todoText.nth(i).innerText());
    };

    // Verify that this todo item is not in the activeTodos array
    expect(activeTodos).not.toContain(todoApp.TODO_ITEMS[0]);
    expect(activeTodos).not.toContain(todoApp.TODO_ITEMS[1]);
  });

  test('should be able to refresh page and validate that todos are still present', async ({ page }) => {
    const todoApp = new TodoApp(page);
    
    // Create all todos
    await todoApp.addAllTodos();

    // Complete first todo item
    await todoApp.todoToggle.nth(0).click();

    // Refresh the page
    await page.reload();

    // Verify that all todo items are still present
    for (let i = 0; i < todoApp.TODO_ITEMS.length; i++) {
      await expect(todoApp.todoText.nth(i)).toHaveText(todoApp.TODO_ITEMS[i]);
    };

    // Verify that first todo item is completed
    await expect(todoApp.todoCheckbox.nth(0)).toHaveClass('completed');

    // Verify number of complete todos in local storage
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(page, 1);

    // Verify number of todos in local storage
    await todoApp.checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should be able to clear completed todos', async ({ page }) => {
    const todoApp = new TodoApp(page);
    
    // Create all todos
    await todoApp.addAllTodos();

    // Complete first todo item
    await todoApp.todoToggle.nth(0).click();

    // Click on the clear completed button
    await todoApp.clearCompleted.click();

    // Verify that only the first todo item is not present
    for (let i = 1; i < todoApp.TODO_ITEMS.length; i++) {
      await expect(todoApp.todoText.nth(i - 1)).toHaveText(todoApp.TODO_ITEMS[i]);
    };

    // Verify number of todos in local storage
    await todoApp.checkNumberOfTodosInLocalStorage(page, 2);

    // Verify number of complete todos in local storage
    await todoApp.checkNumberOfCompletedTodosInLocalStorage(page, 0);
  });
});
