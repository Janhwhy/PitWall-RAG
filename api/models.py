"""
models.py
---------
Pydantic models for the PitWall FastAPI application.
Defines all request and response schemas used across the API routes.
"""

from pydantic import BaseModel


class AskRequest(BaseModel):
    """Request body for POST /ask."""

    question: str
    race: str = "Monaco 2025"


class AgentResult(BaseModel):
    """Per-agent breakdown returned in an AskResponse."""

    agent: str
    answer: str
    chunks_used: int


class AskResponse(BaseModel):
    """Response body for POST /ask."""

    question: str
    final_answer: str
    agents_consulted: list[AgentResult]
    race: str


class BriefCard(BaseModel):
    """A single question/answer card inside a brief or debrief response."""

    title: str
    question: str
    answer: str


class BriefResponse(BaseModel):
    """Response body for GET /brief and GET /debrief."""

    cards: list[BriefCard]
    race: str


class StatusResponse(BaseModel):
    """Response body for GET /status."""

    collections: dict[str, int]


class RaceInfo(BaseModel):
    """A single race weekend that has ingested data available."""

    round: int
    country: str
    year: int
    location: str


class RacesResponse(BaseModel):
    """Response body for GET /races."""

    races: list[RaceInfo]


class DriverStanding(BaseModel):
    """A driver's finishing position, name, and team."""

    position: int
    driver: str
    full_name: str
    team: str


class FastestLap(BaseModel):
    """The fastest lap of the race."""

    driver: str
    full_name: str
    team: str
    lap_number: int
    lap_time_seconds: float


class PitStopInfo(BaseModel):
    """A single pit stop, with computed pit-lane duration."""

    driver: str
    full_name: str
    team: str
    lap_number: int
    duration_seconds: float


class CompoundUsage(BaseModel):
    """How many laps were run on a given tyre compound."""

    compound: str
    count: int


class LapsLed(BaseModel):
    """How many laps a driver spent in P1."""

    driver: str
    full_name: str
    laps_led: int


class GridSlot(BaseModel):
    """A single starting-grid slot from Qualifying."""

    grid_position: int
    driver: str
    full_name: str
    team: str
    q1: float | None = None
    q2: float | None = None
    q3: float | None = None


class RaceStatsResponse(BaseModel):
    """Response body for GET /race-stats — pure SQL-computed facts, no LLM involved."""

    race: str
    year: int
    winner: DriverStanding | None = None
    podium: list[DriverStanding] = []
    fastest_lap: FastestLap | None = None
    avg_lap_seconds: float | None = None
    most_used_compound: CompoundUsage | None = None
    compound_breakdown: list[CompoundUsage] = []
    total_pitstops: int = 0
    fastest_pitstop: PitStopInfo | None = None
    laps_led: list[LapsLed] = []
    pole: GridSlot | None = None
    grid: list[GridSlot] = []
    has_quali_data: bool = False


class PitStopLogEntry(BaseModel):
    """A single pit stop, for the full per-race pit stop log."""

    driver: str
    full_name: str
    team: str
    lap_number: int
    compound: str | None = None
    tyre_life: float | None = None
    duration_seconds: float | None = None


class PitStopLogResponse(BaseModel):
    """Response body for GET /pit-stops."""

    race: str
    year: int
    pit_stops: list[PitStopLogEntry] = []


class WeatherSummaryResponse(BaseModel):
    """Response body for GET /weather-summary — averaged across the race session."""

    race: str
    year: int
    has_data: bool = False
    avg_air_temp: float | None = None
    avg_track_temp: float | None = None
    avg_humidity: float | None = None
    avg_wind_speed: float | None = None
    avg_wind_direction: float | None = None
    rain_probability_pct: float | None = None


class RaceResultRow(BaseModel):
    """A single driver's row in the full race classification."""

    position: int
    driver: str
    full_name: str
    team: str
    laps_completed: int
    status: str
    is_fastest_lap: bool = False


class RaceResultsResponse(BaseModel):
    """Response body for GET /race-results — full classification, all drivers."""

    race: str
    year: int
    results: list[RaceResultRow] = []


class ScheduleSession(BaseModel):
    """A single session (Practice/Qualifying/Sprint/Race) within an event."""

    name: str
    date: str | None = None


class ScheduleEvent(BaseModel):
    """A single race weekend on the calendar, past or future."""

    round: int
    country: str
    location: str
    event_name: str
    event_format: str
    sessions: list[ScheduleSession] = []


class ScheduleResponse(BaseModel):
    """Response body for GET /schedule."""

    year: int
    events: list[ScheduleEvent] = []


class NextRaceResponse(BaseModel):
    """Response body for GET /schedule/next."""

    found: bool
    event: ScheduleEvent | None = None
    year: int | None = None
    race_session_date: str | None = None
    seconds_until: float | None = None


class DriverStandingEntry(BaseModel):
    """A single row in the Drivers' Championship table."""

    position: int
    driver_code: str
    full_name: str
    team: str
    points: float
    wins: int
    nationality: str = ""


class ConstructorStandingEntry(BaseModel):
    """A single row in the Constructors' Championship table."""

    position: int
    team: str
    points: float
    wins: int
    nationality: str = ""


class StandingsResponse(BaseModel):
    """Response body for GET /standings/drivers and GET /standings/constructors."""

    year: int
    round: int
    drivers: list[DriverStandingEntry] = []
    constructors: list[ConstructorStandingEntry] = []
