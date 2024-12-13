CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT NOT NULL UNIQUE,
    -- Data for Oauth
);
CREATE TABLE IF NOT EXISTS boards(
    id INT AUTO_INCREMENT NOT NULL UNIQUE,
    ownerId INT NOT NULL,
    boardName VARCHAR(40) NOT NULL,
);
CREATE TABLE IF NOT EXISTS strokes(
    id INT NOT NULL AUTO_INCREMENT UNIQUE,
    assignedBoardId INT NOT NULL,
    SVG TEXT NOT NULL,
    --
);