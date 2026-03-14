-- WurkFlo Example Seed Data
-- Run this after schema creation to populate sample data

-- NOTE: Replace these UUIDs with actual user IDs from your Supabase Auth

-- Example projects
INSERT INTO projects (id, name, description, owner_id) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'WurkFlo Platform', 'The project management platform itself', NULL),
  ('a1b2c3d4-0001-4000-8000-000000000002', 'Mobile App', 'iOS and Android companion app', NULL);

-- Example sprints
INSERT INTO sprints (id, project_id, name, start_date, end_date, status) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Sprint 1 - Foundation', '2026-03-10', '2026-03-24', 'active'),
  ('b1b2c3d4-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Sprint 2 - Features', '2026-03-25', '2026-04-07', 'planning');

-- Example tasks
INSERT INTO tasks (id, title, description, project_id, sprint_id, priority, story_points, status, due_date) VALUES
  ('c1b2c3d4-0001-4000-8000-000000000001', 'Setup authentication', 'Implement Supabase auth with login/signup', 'a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'high', 5, 'done', '2026-03-14'),
  ('c1b2c3d4-0001-4000-8000-000000000002', 'Build Kanban board', 'Drag and drop task management', 'a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'high', 8, 'in_progress', '2026-03-18'),
  ('c1b2c3d4-0001-4000-8000-000000000003', 'Design dashboard', 'Create dashboard with analytics', 'a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'medium', 5, 'review', '2026-03-20'),
  ('c1b2c3d4-0001-4000-8000-000000000004', 'Sprint management page', 'View and create sprints', 'a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'medium', 3, 'todo', '2026-03-22'),
  ('c1b2c3d4-0001-4000-8000-000000000005', 'API documentation', 'Write API docs', 'a1b2c3d4-0001-4000-8000-000000000001', NULL, 'low', 2, 'backlog', NULL),
  ('c1b2c3d4-0001-4000-8000-000000000006', 'Mobile app wireframes', 'Design mobile app screens', 'a1b2c3d4-0001-4000-8000-000000000002', NULL, 'high', 5, 'todo', '2026-03-28'),
  ('c1b2c3d4-0001-4000-8000-000000000007', 'Setup React Native', 'Initialize the mobile project', 'a1b2c3d4-0001-4000-8000-000000000002', NULL, 'medium', 3, 'backlog', NULL);

-- Example bugs
INSERT INTO bugs (id, title, description, project_id, related_task_id, severity, status) VALUES
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Login redirect loop', 'Users are redirected back to login after authenticating', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1b2c3d4-0001-4000-8000-000000000001', 'critical', 'resolved'),
  ('d1b2c3d4-0001-4000-8000-000000000002', 'Task cards overlap on mobile', 'Kanban columns overlap on small screen widths', 'a1b2c3d4-0001-4000-8000-000000000001', 'c1b2c3d4-0001-4000-8000-000000000002', 'high', 'open'),
  ('d1b2c3d4-0001-4000-8000-000000000003', 'Typo in dashboard header', 'Says "Dashbaord" instead of "Dashboard"', 'a1b2c3d4-0001-4000-8000-000000000001', NULL, 'low', 'closed');

-- Example releases
INSERT INTO releases (id, project_id, version, release_date, status, notes) VALUES
  ('e1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', '0.1.0', '2026-03-14', 'released', 'Initial alpha release with authentication, project creation, and basic task management.'),
  ('e1b2c3d4-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', '0.2.0', '2026-03-28', 'planned', 'Kanban board, sprint management, and bug tracking features.');
