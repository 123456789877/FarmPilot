"""
Seed demo data for FarmPilot MVP.
Run: python seed_data.py
"""
from datetime import date, timedelta
from app.database.database import SessionLocal, engine, Base
from app.models import *
from app.auth.security import get_password_hash

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed():
    # Clear existing (optional for demo)
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()

    # Demo user
    user = User(
        email="farmer@farmpilot.com",
        full_name="Rajesh Kumar",
        hashed_password=get_password_hash("demo1234"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Farm
    farm = Farm(
        name="Green Valley Farm",
        location="Nashik, Maharashtra, India",
        total_area=25.0,
        soil_type="Black Cotton Soil",
        irrigation_type="Drip + Canal",
        description="Mixed crop farm focusing on paddy, tomato and groundnut.",
        owner_id=user.id,
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)

    # Fields
    field_a = Field(name="Field A - Paddy", area=10.0, soil_type="Clay Loam",
                    irrigation_type="Flood", location="North block", status="Active", farm_id=farm.id)
    field_b = Field(name="Field B - Tomato", area=8.0, soil_type="Sandy Loam",
                    irrigation_type="Drip", location="East block", status="Active", farm_id=farm.id)
    field_c = Field(name="Field C - Groundnut", area=7.0, soil_type="Red Soil",
                    irrigation_type="Sprinkler", location="South block", status="Active", farm_id=farm.id)
    db.add_all([field_a, field_b, field_c])
    db.commit()
    db.refresh(field_a)
    db.refresh(field_b)
    db.refresh(field_c)

    today = date.today()

    # Crop cycles
    crop_paddy = CropCycle(
        crop_name="Paddy", variety="Sona Masuri", field_id=field_a.id,
        planting_date=today - timedelta(days=75),
        expected_harvest_date=today + timedelta(days=45),
        current_growth_stage="Flowering", target_yield=45.0, status="Active",
        notes="Good vegetative growth observed."
    )
    crop_tomato = CropCycle(
        crop_name="Tomato", variety="Hybrid- fort", field_id=field_b.id,
        planting_date=today - timedelta(days=40),
        expected_harvest_date=today + timedelta(days=30),
        current_growth_stage="Fruiting", target_yield=25.0, status="Active",
    )
    crop_groundnut = CropCycle(
        crop_name="Groundnut", variety="JL-24", field_id=field_c.id,
        planting_date=today - timedelta(days=20),
        expected_harvest_date=today + timedelta(days=70),
        current_growth_stage="Vegetative", target_yield=12.0, status="Active",
    )
    db.add_all([crop_paddy, crop_tomato, crop_groundnut])
    db.commit()
    db.refresh(crop_paddy)
    db.refresh(crop_tomato)
    db.refresh(crop_groundnut)

    # Activities
    activities = [
        Activity(activity_name="Ploughing", field_id=field_a.id, crop_cycle_id=crop_paddy.id,
                 date=today - timedelta(days=80), cost=4500, status="Completed", notes="Tractor ploughing"),
        Activity(activity_name="Sowing", field_id=field_a.id, crop_cycle_id=crop_paddy.id,
                 date=today - timedelta(days=75), cost=3200, quantity=40, unit="kg", status="Completed"),
        Activity(activity_name="Fertilization", field_id=field_a.id, crop_cycle_id=crop_paddy.id,
                 date=today - timedelta(days=30), cost=8500, quantity=200, unit="kg", status="Completed"),
        Activity(activity_name="Pesticide application", field_id=field_b.id, crop_cycle_id=crop_tomato.id,
                 date=today - timedelta(days=10), cost=2800, status="Completed"),
        Activity(activity_name="Weeding", field_id=field_c.id, crop_cycle_id=crop_groundnut.id,
                 date=today - timedelta(days=5), cost=1500, status="Completed"),
        Activity(activity_name="Fertilization", field_id=field_b.id, crop_cycle_id=crop_tomato.id,
                 date=today + timedelta(days=3), cost=4200, status="Planned"),
        Activity(activity_name="Irrigation", field_id=field_a.id, crop_cycle_id=crop_paddy.id,
                 date=today + timedelta(days=2), cost=800, status="Planned"),
    ]
    db.add_all(activities)

    # Tasks
    tasks = [
        Task(title="Apply second dose of fertilizer to tomato", description="NPK 19:19:19",
             field_id=field_b.id, crop_cycle_id=crop_tomato.id, due_date=today + timedelta(days=3),
             priority="High", status="Pending"),
        Task(title="Check for stem borer in paddy", field_id=field_a.id, crop_cycle_id=crop_paddy.id,
             due_date=today + timedelta(days=1), priority="High", status="Pending"),
        Task(title="Prepare for groundnut weeding", field_id=field_c.id, due_date=today + timedelta(days=7),
             priority="Medium", status="Pending"),
        Task(title="Repair drip lines in Field B", field_id=field_b.id, due_date=today - timedelta(days=2),
             priority="High", status="Overdue"),
        Task(title="Record soil moisture readings", field_id=field_a.id, due_date=today - timedelta(days=5),
             priority="Low", status="Completed"),
    ]
    db.add_all(tasks)

    # Inputs
    inputs = [
        InputItem(name="Paddy seeds - Sona Masuri", category="Seeds", quantity=40, unit="kg",
                  cost=3200, date=today - timedelta(days=75), field_id=field_a.id, crop_cycle_id=crop_paddy.id),
        InputItem(name="Urea", category="Fertilizers", quantity=150, unit="kg", cost=1800,
                  date=today - timedelta(days=30), field_id=field_a.id, crop_cycle_id=crop_paddy.id),
        InputItem(name="DAP", category="Fertilizers", quantity=100, unit="kg", cost=2800,
                  date=today - timedelta(days=30), field_id=field_a.id, crop_cycle_id=crop_paddy.id),
        InputItem(name="Tomato hybrid seeds", category="Seeds", quantity=200, unit="g", cost=1200,
                  date=today - timedelta(days=40), field_id=field_b.id, crop_cycle_id=crop_tomato.id),
        InputItem(name="Organic manure", category="Organic manure", quantity=2, unit="ton", cost=4000,
                  date=today - timedelta(days=50), field_id=field_b.id),
        InputItem(name="Neem oil pesticide", category="Pesticides", quantity=5, unit="litre", cost=1500,
                  date=today - timedelta(days=10), field_id=field_b.id, crop_cycle_id=crop_tomato.id),
    ]
    db.add_all(inputs)

    # Expenses
    expenses = [
        Expense(name="Tractor hire for ploughing", category="Machinery", amount=4500,
                date=today - timedelta(days=80), farm_id=farm.id, field_id=field_a.id, crop_cycle_id=crop_paddy.id),
        Expense(name="Paddy seeds", category="Seeds", amount=3200,
                date=today - timedelta(days=75), farm_id=farm.id, field_id=field_a.id, crop_cycle_id=crop_paddy.id),
        Expense(name="Fertilizer (Urea + DAP)", category="Fertilizers", amount=8500,
                date=today - timedelta(days=30), farm_id=farm.id, field_id=field_a.id, crop_cycle_id=crop_paddy.id),
        Expense(name="Labor for weeding", category="Labor", amount=3500,
                date=today - timedelta(days=20), farm_id=farm.id, field_id=field_a.id),
        Expense(name="Tomato seeds & nursery", category="Seeds", amount=2500,
                date=today - timedelta(days=40), farm_id=farm.id, field_id=field_b.id, crop_cycle_id=crop_tomato.id),
        Expense(name="Drip irrigation setup", category="Irrigation", amount=12000,
                date=today - timedelta(days=60), farm_id=farm.id, field_id=field_b.id),
        Expense(name="Pesticide spray", category="Pesticides", amount=2800,
                date=today - timedelta(days=10), farm_id=farm.id, field_id=field_b.id, crop_cycle_id=crop_tomato.id),
        Expense(name="Groundnut seeds", category="Seeds", amount=4200,
                date=today - timedelta(days=20), farm_id=farm.id, field_id=field_c.id, crop_cycle_id=crop_groundnut.id),
        Expense(name="Labor - general", category="Labor", amount=6000,
                date=today - timedelta(days=15), farm_id=farm.id),
        Expense(name="Transport of inputs", category="Transportation", amount=1800,
                date=today - timedelta(days=25), farm_id=farm.id),
    ]
    db.add_all(expenses)

    # Irrigation
    irrigations = [
        IrrigationRecord(field_id=field_a.id, crop_cycle_id=crop_paddy.id, date=today - timedelta(days=12),
                         water_quantity=50, duration=6, irrigation_method="Flood", cost=600),
        IrrigationRecord(field_id=field_a.id, crop_cycle_id=crop_paddy.id, date=today - timedelta(days=5),
                         water_quantity=45, duration=5, irrigation_method="Flood", cost=550),
        IrrigationRecord(field_id=field_b.id, crop_cycle_id=crop_tomato.id, date=today - timedelta(days=3),
                         water_quantity=12, duration=2, irrigation_method="Drip", cost=200),
        IrrigationRecord(field_id=field_b.id, crop_cycle_id=crop_tomato.id, date=today - timedelta(days=8),
                         water_quantity=15, duration=2.5, irrigation_method="Drip", cost=250),
        IrrigationRecord(field_id=field_c.id, crop_cycle_id=crop_groundnut.id, date=today - timedelta(days=4),
                         water_quantity=20, duration=3, irrigation_method="Sprinkler", cost=300),
    ]
    db.add_all(irrigations)

    # Harvest (partial for tomato)
    harvests = [
        Harvest(field_id=field_b.id, crop_cycle_id=crop_tomato.id, harvest_date=today - timedelta(days=2),
                quantity=1200, unit="kg", selling_price=28.0, notes="First picking - good quality"),
        Harvest(field_id=field_b.id, crop_cycle_id=crop_tomato.id, harvest_date=today - timedelta(days=7),
                quantity=800, unit="kg", selling_price=25.0, notes="Early picking"),
    ]
    db.add_all(harvests)

    db.commit()
    print("✅ Demo data seeded successfully!")
    print("Login credentials:")
    print("  Email: farmer@farmpilot.com")
    print("  Password: demo1234")
    print("Farm: Green Valley Farm (25 acres)")

if __name__ == "__main__":
    seed()
    db.close()
