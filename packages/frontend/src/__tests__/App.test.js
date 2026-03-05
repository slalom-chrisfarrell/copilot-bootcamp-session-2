/*jslint browser, indent: 4, maxlen: 180 */
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";

import App from "../App";

const mockItems = [
    { id: 1, name: "Test Item 1", due_date: "2026-06-01", created_at: "2023-01-01T00:00:00.000Z" },
    { id: 2, name: "Test Item 2", due_date: null, created_at: "2023-01-02T00:00:00.000Z" },
];

const server = setupServer(
    rest.get("/api/items", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockItems));
    }),

    rest.post("/api/items", (req, res, ctx) => {
        const { name, due_date } = req.body;
        if (!name || name.trim() === "") {
            return res(ctx.status(400), ctx.json({ error: "Item name is required" }));
        }
        return res(ctx.status(201), ctx.json({ id: 3, name, due_date: due_date || null, created_at: new Date().toISOString() }));
    }),

    rest.put("/api/items/:id", (req, res, ctx) => {
        const { id } = req.params;
        const { name, due_date } = req.body;
        return res(ctx.status(200), ctx.json({ id: parseInt(id), name, due_date: due_date || null, created_at: "2023-01-01T00:00:00.000Z" }));
    }),

    rest.delete("/api/items/:id", (req, res, ctx) => {
        const { id } = req.params;
        return res(ctx.status(200), ctx.json({ message: "Item deleted successfully", id: parseInt(id) }));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("App Component", () => {
    test("renders the app header", async () => {
        await act(async () => {
            render(<App />);
        });
        expect(screen.getByRole("heading", { name: /to do app/i })).toBeInTheDocument();
        expect(screen.getByText(/keep track of your tasks/i)).toBeInTheDocument();
    });

    test("loads and displays items from the API", async () => {
        await act(async () => {
            render(<App />);
        });

        expect(screen.getByRole("progressbar")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Test Item 1")).toBeInTheDocument();
            expect(screen.getByText("Test Item 2")).toBeInTheDocument();
        });
    });

    test("displays due date for items that have one", async () => {
        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {
            expect(screen.getByText(/due: 2026-06-01/i)).toBeInTheDocument();
        });
    });

    test("adds a new task", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());

        const nameInput = screen.getByLabelText("Task name");
        await user.type(nameInput, "New Test Task");

        const submitButton = screen.getByRole("button", { name: /add task/i });
        await act(async () => {
            await user.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText("New Test Task")).toBeInTheDocument();
        });
    });

    test("enters edit mode and saves an updated task", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => expect(screen.getByText("Test Item 1")).toBeInTheDocument());

        const editButton = screen.getByRole("button", { name: /edit task test item 1/i });
        await act(async () => {
            await user.click(editButton);
        });

        const editInput = screen.getByLabelText("Edit task name");
        await user.clear(editInput);
        await user.type(editInput, "Updated Item 1");

        const saveButton = screen.getByRole("button", { name: /save task/i });
        await act(async () => {
            await user.click(saveButton);
        });

        await waitFor(() => {
            expect(screen.getByText("Updated Item 1")).toBeInTheDocument();
        });
    });

    test("cancels edit mode without saving", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => expect(screen.getByText("Test Item 1")).toBeInTheDocument());

        const editButton = screen.getByRole("button", { name: /edit task test item 1/i });
        await act(async () => {
            await user.click(editButton);
        });

        const cancelButton = screen.getByRole("button", { name: /cancel edit/i });
        await act(async () => {
            await user.click(cancelButton);
        });

        expect(screen.getByText("Test Item 1")).toBeInTheDocument();
        expect(screen.queryByLabelText("Edit task name")).not.toBeInTheDocument();
    });

    test("deletes a task", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => expect(screen.getByText("Test Item 1")).toBeInTheDocument());

        const deleteButton = screen.getByRole("button", { name: /delete task test item 1/i });
        await act(async () => {
            await user.click(deleteButton);
        });

        await waitFor(() => {
            expect(screen.queryByText("Test Item 1")).not.toBeInTheDocument();
        });
    });

    test("toggles sort by due date", async () => {
        const user = userEvent.setup();

        server.use(
            rest.get("/api/items", (req, res, ctx) => {
                const sort = req.url.searchParams.get("sort");
                const sorted = sort === "due_date"
                    ? [...mockItems].sort((a, b) => (a.due_date || "z").localeCompare(b.due_date || "z"))
                    : mockItems;
                return res(ctx.status(200), ctx.json(sorted));
            })
        );

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());

        const sortButton = screen.getByRole("button", { name: /sort by due date/i });
        await act(async () => {
            await user.click(sortButton);
        });

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /sorted by due date/i })).toBeInTheDocument();
        });
    });

    test("shows an error message when the API fails", async () => {
        server.use(
            rest.get("/api/items", (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {
            expect(screen.getByRole("alert")).toBeInTheDocument();
            expect(screen.getByText(/failed to fetch data/i)).toBeInTheDocument();
        });
    });

    test("shows empty state message when no tasks exist", async () => {
        server.use(
            rest.get("/api/items", (req, res, ctx) => {
                return res(ctx.status(200), ctx.json([]));
            })
        );

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {
            expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
        });
    });
});