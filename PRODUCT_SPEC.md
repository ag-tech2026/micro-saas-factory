# Product Spec

## Product
name: Poker AI Review
tagline: Upload a hand screenshot. Get instant GTO analysis.
target_user: poker players of all skill levels

## Input
type: file_image
accept: image/jpeg,image/png
label: Upload your poker screenshot
example_input_description: a Rush & Cash hand showing a preflop raise and call with JJ

## Analysis
what_it_analyzes: poker hand screenshots for GTO-based strategic analysis of micro-stakes cash games
tone: friendly_coach           # friendly_coach | professional | clinical
output_fields:
  - hand_info: object — { stakes, game_type, hero_position, hero_hand, effective_stack_bb, assumptions[] }
  - board: object — { flop, turn, river } (empty string if street did not occur)
  - action_summary: object — { preflop, flop, turn, river } (empty string if street did not occur)
  - analysis: object — { summary: string (2-4 sentences), main_takeaway: string }
  - good_plays: array of { label: string, explanation: string } (minimum 3)
  - areas_to_improve: array of { label, mistake, recommended_line } (minimum 3)
  - improvement_tips: array of strings (3-5 tips)
  - tags: array of kebab-case strings (2-4 tags)
  - difficulty_level: enum("beginner" | "reg")
  - confidence_score: object — { hero_decisions: number 0-1 }

## Credits
free_credits: 3              # initial credits for new users (set in DB schema default)
credits_per_analysis: 1
pack_size: 50
pack_price: "$9"
polar_product_id: prod_xxx   # goes in .env.local as POLAR_PRODUCT_ID, not in config.ts

## Branding
primary_color: "#6d28d9"
logo_emoji: ♠
nav_action_label: Analyze Hand
