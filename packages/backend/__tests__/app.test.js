/*jslint node, indent: 4, maxlen: 180 */
const request = require('supertest');
const { app, db } = require('../src/app');

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
const createItem = async (name = 'Temp Item to Delete', due_date = null) => {
    const response = await request(app)
        .post('/api/items')
        .send({ name, due_date })
        .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    return response.body;
};

describe('API Endpoints', () => {
    describe('GET /api/items', () => {
        it('should return all items', async () => {
            const response = await request(app).get('/api/items');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            const item = response.body[0];
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('name');
            expect(item).toHaveProperty('due_date');
            expect(item).toHaveProperty('created_at');
        });

        it('should return items sorted by due date when sort=due_date is passed', async () => {
            await createItem('Later Task', '2026-12-31');
            await createItem('Earlier Task', '2026-01-01');

            const response = await request(app).get('/api/items?sort=due_date');

            expect(response.status).toBe(200);
            const datedItems = response.body.filter((item) => item.due_date !== null);
            const dates = datedItems.map((item) => item.due_date);
            const sorted = [...dates].sort();
            expect(dates).toEqual(sorted);
        });
    });

    describe('POST /api/items', () => {
        it('should create a new item', async () => {
            const newItem = { name: 'Test Item', due_date: '2026-06-15' };
            const response = await request(app)
                .post('/api/items')
                .send(newItem)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(newItem.name);
            expect(response.body.due_date).toBe(newItem.due_date);
            expect(response.body).toHaveProperty('created_at');
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/api/items')
                .send({})
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Item name is required');
        });

        it('should return 400 if name is empty', async () => {
            const response = await request(app)
                .post('/api/items')
                .send({ name: '' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Item name is required');
        });
    });

    describe('PUT /api/items/:id', () => {
        it('should update an existing item name and due date', async () => {
            const item = await createItem('Original Name', null);

            const response = await request(app)
                .put(`/api/items/${item.id}`)
                .send({ name: 'Updated Name', due_date: '2026-09-01' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Name');
            expect(response.body.due_date).toBe('2026-09-01');
            expect(response.body.id).toBe(item.id);
        });

        it('should return 404 when item does not exist', async () => {
            const response = await request(app)
                .put('/api/items/999999')
                .send({ name: 'Ghost Item' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Item not found');
        });

        it('should return 400 when name is missing on update', async () => {
            const item = await createItem('Name For 400 Test');

            const response = await request(app)
                .put(`/api/items/${item.id}`)
                .send({ name: '' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Item name is required');
        });

        it('should return 400 for invalid id', async () => {
            const response = await request(app)
                .put('/api/items/not-a-number')
                .send({ name: 'Valid Name' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Valid item ID is required');
        });
    });

    describe('DELETE /api/items/:id', () => {
        it('should delete an existing item', async () => {
            const item = await createItem('Item To Be Deleted');

            const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

            const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
            expect(deleteAgain.status).toBe(404);
            expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
        });

        it('should return 404 when item does not exist', async () => {
            const response = await request(app).delete('/api/items/999999');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Item not found');
        });

        it('should return 400 for invalid id', async () => {
            const response = await request(app).delete('/api/items/abc');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Valid item ID is required');
        });
    });
});