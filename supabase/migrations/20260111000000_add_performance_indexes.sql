-- Performance optimization migration: Add indexes for frequently queried columns
-- This will significantly speed up queries on organizer_id, user_id, event_id, and status fields

-- Hotels table indexes
CREATE INDEX IF NOT EXISTS idx_hotels_organizer_id ON hotels(organizer_id);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_created_at ON hotels(created_at DESC);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status_created ON events(status, created_at DESC);

-- Invites table indexes
CREATE INDEX IF NOT EXISTS idx_invites_organizer_id ON invites(organizer_id);
CREATE INDEX IF NOT EXISTS idx_invites_user_id ON invites(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_event_id ON invites(event_id);
CREATE INDEX IF NOT EXISTS idx_invites_hotel_id ON invites(hotel_id);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_created_at ON invites(created_at DESC);

-- Favorites table indexes
CREATE INDEX IF NOT EXISTS idx_favorites_organizer_id ON favorites(organizer_id);
CREATE INDEX IF NOT EXISTS idx_favorites_event_id ON favorites(event_id);
CREATE INDEX IF NOT EXISTS idx_favorites_organizer_event ON favorites(organizer_id, event_id);

-- Chats table indexes
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_organizer_id ON chats(organizer_id);
CREATE INDEX IF NOT EXISTS idx_chats_invite_id ON chats(invite_id);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at);

-- User roles table index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Profiles table index
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Hotel halls table index
CREATE INDEX IF NOT EXISTS idx_hotel_halls_hotel_id ON hotel_halls(hotel_id);

-- Menu bundles table index
CREATE INDEX IF NOT EXISTS idx_menu_bundles_hotel_id ON menu_bundles(hotel_id);

-- Add comments explaining the optimization
COMMENT ON INDEX idx_events_status_created IS 'Composite index for common query pattern: status + created_at ordering';
COMMENT ON INDEX idx_favorites_organizer_event IS 'Composite index for checking if organizer favorited specific event';
COMMENT ON INDEX idx_messages_chat_created IS 'Composite index for fetching messages by chat ordered by time';
