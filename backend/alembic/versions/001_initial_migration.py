"""initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=True),
        sa.Column('avatar', sa.String(), nullable=True),
        sa.Column('google_id', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('google_id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Create pdfs table
    op.create_table(
        'pdfs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('original_name', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('processing', 'completed', 'failed', name='pdfstatus'), nullable=True),
        sa.Column('upload_date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create courses table
    op.create_table(
        'courses',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('pdf_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('objectives', sa.JSON(), nullable=False),
        sa.Column('difficulty', sa.Enum('beginner', 'intermediate', 'advanced', name='difficulty'), nullable=True),
        sa.Column('estimated_time', sa.Integer(), nullable=False),
        sa.Column('prerequisites', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create chapters table
    op.create_table(
        'chapters',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('course_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create lessons table
    op.create_table(
        'lessons',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('chapter_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('example', sa.Text(), nullable=True),
        sa.Column('key_takeaways', sa.JSON(), nullable=True),
        sa.Column('important_notes', sa.JSON(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.Column('estimated_time', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create quizzes table
    op.create_table(
        'quizzes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('course_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('questions', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create quiz_attempts table
    op.create_table(
        'quiz_attempts',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('quiz_id', sa.String(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('answers', sa.JSON(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['quiz_id'], ['quizzes.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create progress table
    op.create_table(
        'progress',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('course_id', sa.String(), nullable=False),
        sa.Column('lesson_id', sa.String(), nullable=True),
        sa.Column('chapter_id', sa.String(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('time_spent', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id'], ),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create chat_histories table
    op.create_table(
        'chat_histories',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('course_id', sa.String(), nullable=False),
        sa.Column('messages', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('chat_histories')
    op.drop_table('progress')
    op.drop_table('quiz_attempts')
    op.drop_table('quizzes')
    op.drop_table('lessons')
    op.drop_table('chapters')
    op.drop_table('courses')
    op.drop_table('pdfs')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
