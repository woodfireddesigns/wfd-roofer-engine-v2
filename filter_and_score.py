import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("Error: Missing required environment variables in .env")
    exit(1)

# Initialize client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def score_lead(lead):
    score = 0
    
    # 1. Review Count
    reviews = lead.get("google_review_count", 0)
    if reviews >= 40:
        score += 2
    elif reviews >= 10:
        score += 1
        
    # 2. Star Rating
    rating = lead.get("google_star_rating")
    if rating:
        rating = float(rating)
        if rating >= 4.4:
            score += 2
        elif 4.0 <= rating < 4.4:
            score += 1
            
    # 3. Website status
    if not lead.get("has_website"):
        score += 3
    else:
        score += 1
        
    # 4. Proximity bonus (Handling full names and abbreviations)
    local_states = ['MD', 'Maryland', 'VA', 'Virginia', 'DE', 'Delaware', 'PA', 'Pennsylvania', 'NC', 'North Carolina']
    if lead.get("state") in local_states:
        score += 1
        
    # Assign Grade
    if score >= 6:
        grade = 'A'
    elif 4 <= score <= 5:
        grade = 'B'
    else:
        grade = 'C'
        
    return score, grade

def main():
    # Force reset
    supabase.table("roofing_leads").update({"grade": "ungraded"}).neq("id", "00000000-0000-0000-0000-000000000000").execute()
    
    print("Fetching leads for refined re-scoring...")
    response = supabase.table("roofing_leads").select("*").execute()
    leads = response.data
    
    if not leads:
        print("No leads found.")
        return
        
    print(f"Scoring {len(leads)} leads...")
    
    grade_counts = {'A': 0, 'B': 0, 'C': 0}
    
    for lead in leads:
        score, grade = score_lead(lead)
        
        supabase.table("roofing_leads").update({
            "score": score,
            "grade": grade
        }).eq("id", lead["id"]).execute()
        
        grade_counts[grade] += 1
        
    print("\nRefined Scoring Complete!")
    print(f"Total scored: {len(leads)}")
    print(f"Grade A: {grade_counts['A']}")
    print(f"Grade B: {grade_counts['B']}")
    print(f"Grade C: {grade_counts['C']}")

if __name__ == "__main__":
    main()
