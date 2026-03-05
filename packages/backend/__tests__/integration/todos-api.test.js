/*jslint node, indent: 4, maxlen: 180 */
const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
    if (db) {
        db.close();
    }
});

/**
 * @param {string} name
 * @param {string|null} due_date
 * @returns {Promise<{id: number, name: string, due_date: string|null, created_at: string}>}
 */
const createItem = async (name, due_date = null) => {
    const response = await request(app)
        .post('/api/items')
        .send({ name, due_date })
        .set('Accept', 'application/json');
    expect(response.status).toBe(201);
    return response.body;
};

describe('Todos API Integration Tests', () => {
    describe('GET /api/items', () => {
        it('returns 200 and all items as a JSON array', async () => {
            const response = await request(app).get('/api/items');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('returns items with all required fields', async () => {
            const response = await request(app).get('/api/items');
            const item = response.body[0];
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('name');
            expect(item).toHaveProperty('due_date');
            expect(item).toHaveProperty('created_at');
        });

        it('returns items in due-date ascending order when sort=due_date', async () => {
            await createItem('Far Future Task', '2027-12-31');
            await createItem('Near Future Task', '2026-03-01');

            const response = await request(app).get('/api/items?sort=due_date');
            expect(response.status).toBe(200);

            const datedItems = response.body.filter((item) => item.due_date !== null);
            const dates = datedItems.map((item) => item.due_date);
            const sorted = [...dates].sort();
            expect(dates).toEqual(sorted);
        });

        it('places items without a due date at the end when sort=due_date', async () => {
            await createItem('No Due Date Task', null);
            await createItem('Has Due Date Task', '2026-06-01');

            const response = await request(app).get('/api/items?sort=due_date');
            expect(response.status).toBe(200);

            const nullIndex = response.body.findIndex((item) => item.due_date === null);
            const lastNonNullIndex = response.body.map((item) => item.due_date).lastIndexOf(
                response.body.filter((item) => item.due_date !== null).pop()?.due_date
            );
            expect(nullIndex).toBeGreaterThan(lastNonNullIndex);
        });
    });

    describe('POST /api/items', () => {
        it('creates a new item and returns 201 with the created item', async () => {
            const response = await request(app)
                .post('/api/items')
                .send({ name: 'Integration Test Item', due_date: '2026-06-15' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Integration Test Item');
            expect(response.body.due_date).toBe('2026-06-15');
        });

        it('creates item without a due date when due_date is omitted', async () => {
            const response = await request(app)
                .post('/api/items')
                .send({ name: 'No Due Date' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body.due_date).toBeNull();
        });

        it('returns 400 when name is missing', async () => {
            const response = await request(app)
                .post('/api/items')
                .send({})
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Item name is required');
        });

        it('returns 400 when name is an empty string', async () => {
            const response = await request(app)
                .post('/api/items')
                .send({ name: '' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Item name is required');
        });
    });

    describe('PUT /api/items/:id', () => {
        it('updates an existing item and returns 200 with the updated item', async () => {
            const created = await createItem('Original Name', null);

            const response = await request(app)
                .put(`/api/items/${created.id}`)
                .send({ name: 'Updated Name', due_date: '2026-09-01' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Name');
            expect(response.body.due_date).toBe('2026-09-01');
            expect(response.body.id).toBe(created.id);
        });

        it('clears due date when null is sent', async () => {
            const created = await createItem('Clear Due Date', '2026-05-01');

            const response = await request(app)
                .put(`/api/items/${created.id}`)
                .send({ name: 'Clear Due Date', due_date: null })
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.due_date).toBeNull();
        });

        it('returns 404 when item does not exist', async () => {
            const response = await request(app)
                .put('/api/items/999999')
                .send({ name: 'Ghost Item' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Item not found');
        });

        it('returns 400 when name is missing', async () => {
            const created = await createItem('Name For 400 Test');

            const response = await request(app)
                .put(`/api/items/${created.id}`)
                .send({ name: '' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Item name is required');
        });

        it('returns 400 for a non-numeric id', async () => {
            const response = await request(app)
                .put('/api/items/not-a-number')
                .send({ name: 'Valid Name' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Valid item ID is required');
        });
    });

    describe('DELETE /api/items/:id', () => {
        it('deletes an existing item and returns 200', async () => {
            const created = await createItem('Item to Delete');

            const response = await request(app).delete(`/api/items/${created.id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Item deleted successfully');
            expect(response.body.id).toBe(created.id);
        });

        it('returns 404 when trying to delete an already-deleted item', async () => {
            const created = await createItem('Item to Delete Twice');

            await request(app).delete(`/api/items/${created.id}`);
            const response = await request(app).delete(`/api/items/${created.id}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Item not found');
        });

        it('returns 404 when item does not exist', async () => {
            const response = await request(app).delete('/api/items/999998');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Item not found');
        });

        it('returns 400 for a non-numeric id', async () => {
            const response = await request(app).delete('/api/items/not-a-number');
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Valid item ID is required');
        });
    });
});
