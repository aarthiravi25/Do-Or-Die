# Do-Or-Die: Health Survival Calculator

## Overview

Do-Or-Die is an interactive web application that calculates and visualizes your survival time based on your age and dietary choices. This project combines health awareness with an engaging dark-themed user interface to provide a unique perspective on dietary habits.

## Tech Stack

### Frontend Technologies
- **HTML5** - Structure and markup
- **CSS3** - Styling and responsive design
- **Vanilla JavaScript** - Interactive functionality
- **Three.js** - 3D visualizations and animations

## Application Structure

The application is divided into three main pages:

### 1. User Information Collection (Page 1)
- **Personal Details**
  - Name, age, and gender input
  - Location selection (country, state, city)
  - Optional photo upload
- **Food Selection**
  - Interactive food category interface
  - Multiple food selection options
  - Submit button to proceed

### 2. User Summary (Page 2)
- **Profile Display**
  - User's uploaded photo (if provided)
  - Selected personal information
- **Dietary Choices**
  - Fruits of Virtue
  - Vegetables of Virtue
  - Healthy Sustenance
  - Fast Food Sins
  - Junk of Doom
- **Navigation**
  - Button to proceed to nutrition results

### 3. Nutrition Results (Page 3)
- **Visual Elements**
  - 3D visualization with survival animation
  - Interactive health status display
- **Results**
  - Survival time prediction
  - Detailed calculation breakdown
  - Dramatic survival message
- **Controls**
  - Option to edit food choices
  - Reset all selections

## Survival Calculation System

### Age Factor Points

| Age Range | Points |
|-----------|--------|
| < 18 years | 45 |
| 18-29 years | 32 |
| 30-49 years | 28 |
| 50-69 years | 15 |
| 70+ years | 2 |

### Food Scoring System

#### Healthy Foods (+100 points each)

**Fruits:**
- Apple, Banana, Orange, Mango
- Grapes, Pineapple, Strawberry
- Blueberry, Watermelon

**Vegetables:**
- Spinach, Carrot, Broccoli
- Tomato, Lettuce, Kale
- Cauliflower, Cucumber
- Bell Pepper, Sweet Potato

**Protein & Healthy Snacks:**
- Nuts, Yogurt, Oatmeal
- Salmon, Quinoa, Avocado
- Chicken, Tofu

#### Unhealthy Foods (-30 points each)

**Fast Food:**
- Pizza, Burger, Fries
- Hot Dog, Fried Chicken
- Taco, Nuggets

**Junk Food:**
- Chips, Soda, Candy
- Cookies, Ice Cream
- Doughnut, Chocolate
- Energy Drink

### Calculation Formula

1. **Base Score:**
   ```javascript
   totalHealthScore = ageFactor + foodScore
   ```

2. **Days Calculation:**
   ```javascript
   survivalDays = Math.floor(totalHealthScore * 5) + Math.floor(Math.random() * 5)
   ```

3. **Limits:**
   - Maximum: 14,600 days (40 years)
   - Minimum: 0 days

## Setup Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Do-Or-Die.git
   ```

2. **Navigate to project directory:**
   ```bash
   cd Do-Or-Die
   ```

3. **Open `index.html` in a modern web browser**

4. **Enter your details and food choices**

5. **View your survival prediction**

## Roadmap

- [ ] Enhanced nutritional analysis
- [ ] Expanded food categories
- [ ] Social sharing features
- [ ] Personalized health recommendations
- [ ] Mobile app version
- [ ] Integration with health APIs

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create your feature branch:**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**



---

**Made with❤️**