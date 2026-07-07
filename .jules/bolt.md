## 2025-05-14 - [Batching N+1 API Calls for Dashboard Stats]
**Learning:** Found an N+1 query pattern in the frontend where `DashboardScreen` and `ProjectsListScreen` were fetching tasks and deliverables for each project individually to calculate aggregate statistics. This resulted in 2N+1 API requests on every page load, which scales poorly as the number of projects grows.
**Action:** Implement batch fetch endpoints `/api/tasks` and `/api/deliverables` to retrieve all data in a single request, reducing the total requests to 3 regardless of project count.
