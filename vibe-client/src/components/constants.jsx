import React from 'react';
import { Code, Palette, Database, Globe, Smartphone, Brain, ShoppingCart, Heart } from 'lucide-react';

export const CATEGORY_ICONS = {
  'Development': <Code size={14} />,
  'Design': <Palette size={14} />,
  'Data Science': <Database size={14} />,
  'Web Development': <Globe size={14} />,
  'Mobile': <Smartphone size={14} />,
  'AI/ML': <Brain size={14} />,
  'E-Commerce': <ShoppingCart size={14} />,
  'Healthcare': <Heart size={14} />,
};


export const MOCK_STATS = {
  totalStudents: 1250,
  acceptanceRate: 78
};

export const MOCK_POSTS = [
  {
    id: '1',
    authorName: 'TechCorp Solutions',
    authorRole: 'Industry Partner',
    authorAvatar: 'https://picsum.photos/seed/company2/200',
    content: 'We\'re excited to announce our new AI internship program! Looking for talented students who are passionate about machine learning and want to work on real-world projects.',
    imageUrl: 'https://picsum.photos/seed/tech1/600/300',
    tags: ['AI', 'Internship', 'MachineLearning'],
    likes: 45,
    comments: [
      {
        id: '1',
        author: {
          name: 'Arjun Patel',
          role: 'Student',
          avatar: 'https://picsum.photos/seed/student1/200'
        },
        content: 'This sounds amazing! I\'ve been working on ML projects for the past year. How can I apply?',
        timestamp: '1 hour ago',
        likes: 3
      },
      {
        id: '2',
        author: {
          name: 'Dr. Sarah Chen',
          role: 'Faculty',
          avatar: 'https://picsum.photos/seed/faculty1/200'
        },
        content: 'Great initiative! I\'ll share this with my students who are specializing in AI.',
        timestamp: '30 minutes ago',
        likes: 5
      }
    ],
    commentCount: 12,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    authorName: 'Dr. Sarah Chen',
    authorRole: 'Faculty Mentor',
    authorAvatar: 'https://picsum.photos/seed/faculty2/200',
    content: 'Great to see so many students participating in the React development challenge. Remember to focus on clean code architecture and proper state management!',
    tags: ['React', 'Development', 'Mentorship'],
    likes: 28,
    comments: [
      {
        id: '3',
        author: {
          name: 'Priya Sharma',
          role: 'Student',
          avatar: 'https://picsum.photos/seed/student2/200'
        },
        content: 'Thank you for the guidance! Your tips on useCallback really helped optimize my component.',
        timestamp: '45 minutes ago',
        likes: 2
      }
    ],
    commentCount: 8,
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    authorName: 'Riya Sharma',
    authorRole: 'Student',
    authorAvatar: 'https://picsum.photos/seed/student3/200',
    content: 'Just completed my first industry task! The mentorship from faculty really helped me understand the business requirements better. Excited to see the results!',
    tags: ['Achievement', 'Mentorship', 'Growth'],
    likes: 67,
    comments: [
      {
        id: '4',
        author: {
          name: 'TechCorp Solutions',
          role: 'Industry Partner',
          avatar: 'https://picsum.photos/seed/company2/200'
        },
        content: 'Congratulations! We\'re impressed with your dedication and problem-solving approach.',
        timestamp: '2 hours ago',
        likes: 8
      },
      {
        id: '5',
        author: {
          name: 'Rahul Kumar',
          role: 'Student',
          avatar: 'https://picsum.photos/seed/student4/200'
        },
        content: 'Inspiring! Can you share some tips on how you approached the task?',
        timestamp: '1 hour ago',
        likes: 1
      }
    ],
    commentCount: 15,
    timestamp: '6 hours ago'
  },
  {
    id: '4',
    authorName: 'InnovateLab',
    authorRole: 'Industry Partner',
    authorAvatar: 'https://picsum.photos/seed/company3/200',
    content: 'Looking for creative UI/UX designers for our upcoming mobile app project. This is a great opportunity to work with cutting-edge design systems and user research.',
    imageUrl: 'https://picsum.photos/seed/design1/600/300',
    tags: ['Design', 'Mobile', 'UX'],
    likes: 34,
    comments: [],
    commentCount: 9,
    timestamp: '8 hours ago'
  }
];
