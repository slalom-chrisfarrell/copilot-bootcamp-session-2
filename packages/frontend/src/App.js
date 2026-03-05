/*jslint browser, indent: 4, maxlen: 180 */
import { useCallback, useEffect, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    CssBaseline,
    IconButton,
    List,
    ListItem,
    TextField,
    ThemeProvider,
    Typography,
    createTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SortIcon from "@mui/icons-material/Sort";

const theme = createTheme({
    palette: {
        primary: {
            main: "#E65100",
        },
        secondary: {
            main: "#FF8F00",
        },
        background: {
            default: "#FFF8F0",
            paper: "#FFFFFF",
        },
    },
});

/**
 * @returns {JSX.Element}
 */
function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItem, setNewItem] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [sortByDueDate, setSortByDueDate] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDueDate, setEditDueDate] = useState("");

    /**
     * @param {boolean} sorted
     * @returns {Promise<void>}
     */
    const fetchData = useCallback(async (sorted) => {
        try {
            setLoading(true);
            const url = sorted ? "/api/items?sort=due_date" : "/api/items";
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError("Failed to fetch data: " + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(sortByDueDate);
    }, [fetchData, sortByDueDate]);

    /**
     * @param {React.FormEvent<HTMLFormElement>} e
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        try {
            const response = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newItem, due_date: newDueDate || null }),
            });

            if (!response.ok) {
                throw new Error("Failed to add item");
            }

            const result = await response.json();
            setData((prev) => [...prev, result]);
            setNewItem("");
            setNewDueDate("");
        } catch (err) {
            setError("Error adding item: " + err.message);
        }
    };

    /**
     * @param {number} itemId
     * @returns {Promise<void>}
     */
    const handleDelete = async (itemId) => {
        try {
            const response = await fetch(`/api/items/${itemId}`, { method: "DELETE" });

            if (!response.ok) {
                throw new Error("Failed to delete item");
            }

            setData((prev) => prev.filter((item) => item.id !== itemId));
            setError(null);
        } catch (err) {
            setError("Error deleting item: " + err.message);
        }
    };

    /**
     * @param {{ id: number, name: string, due_date: string|null }} item
     * @returns {void}
     */
    const handleEditStart = (item) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditDueDate(item.due_date || "");
    };

    /**
     * @returns {void}
     */
    const handleEditCancel = () => {
        setEditingId(null);
        setEditName("");
        setEditDueDate("");
    };

    /**
     * @param {number} itemId
     * @returns {Promise<void>}
     */
    const handleEditSave = async (itemId) => {
        if (!editName.trim()) return;

        try {
            const response = await fetch(`/api/items/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, due_date: editDueDate || null }),
            });

            if (!response.ok) {
                throw new Error("Failed to update item");
            }

            const updated = await response.json();
            setData((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
            handleEditCancel();
        } catch (err) {
            setError("Error updating item: " + err.message);
        }
    };

    /**
     * @returns {void}
     */
    const handleToggleSort = () => {
        setSortByDueDate((prev) => !prev);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
                <Container maxWidth="md">
                    <Box
                        sx={{ bgcolor: "primary.main", color: "white", borderRadius: 2, p: 3, mb: 4, textAlign: "center" }}
                        role="banner"
                    >
                        <Typography variant="h4" component="h1" fontWeight="bold">
                            To Do App
                        </Typography>
                        <Typography variant="subtitle1">Keep track of your tasks</Typography>
                    </Box>

                    {error && (
                        <Typography role="alert" color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                                Add New Task
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                <TextField
                                    label="Task name"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder="Enter task name"
                                    required
                                    size="small"
                                    sx={{ flex: 2, minWidth: 200 }}
                                    inputProps={{ "aria-label": "Task name" }}
                                />
                                <TextField
                                    label="Due date"
                                    type="date"
                                    value={newDueDate}
                                    onChange={(e) => setNewDueDate(e.target.value)}
                                    size="small"
                                    sx={{ flex: 1, minWidth: 160 }}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ "aria-label": "Due date" }}
                                />
                                <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: "center" }}>
                                    Add Task
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" component="h2">
                                    Tasks
                                </Typography>
                                <Button
                                    variant={sortByDueDate ? "contained" : "outlined"}
                                    color="secondary"
                                    startIcon={<SortIcon />}
                                    onClick={handleToggleSort}
                                    aria-pressed={sortByDueDate}
                                >
                                    {sortByDueDate ? "Sorted by Due Date" : "Sort by Due Date"}
                                </Button>
                            </Box>

                            {loading && (
                                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                                    <CircularProgress aria-label="Loading tasks" />
                                </Box>
                            )}

                            {!loading && data.length === 0 && (
                                <Typography color="text.secondary">No tasks found. Add some!</Typography>
                            )}

                            <List disablePadding>
                                {data.map((item) => (
                                    <ListItem
                                        key={item.id}
                                        divider
                                        sx={{ gap: 1, flexWrap: "wrap", alignItems: "flex-start", py: 1.5 }}
                                    >
                                        {editingId === item.id ? (
                                            <>
                                                <TextField
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    size="small"
                                                    sx={{ flex: 2, minWidth: 160 }}
                                                    inputProps={{ "aria-label": "Edit task name" }}
                                                />
                                                <TextField
                                                    type="date"
                                                    value={editDueDate}
                                                    onChange={(e) => setEditDueDate(e.target.value)}
                                                    size="small"
                                                    sx={{ flex: 1, minWidth: 140 }}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ "aria-label": "Edit due date" }}
                                                />
                                                <IconButton
                                                    onClick={() => handleEditSave(item.id)}
                                                    aria-label="Save task"
                                                    color="primary"
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                                <IconButton onClick={handleEditCancel} aria-label="Cancel edit">
                                                    <CloseIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography>{item.name}</Typography>
                                                    {item.due_date && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Due: {item.due_date}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <IconButton
                                                    onClick={() => handleEditStart(item)}
                                                    aria-label={`Edit task ${item.name}`}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(item.id)}
                                                    aria-label={`Delete task ${item.name}`}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default App;