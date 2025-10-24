import java.util.*;

public class MovieReviewSystem {
    // Console color codes (like CSS colors)
    public static final String RESET = "\033[0m";
    public static final String RED = "\033[0;31m";
    public static final String GREEN = "\033[0;32m";
    public static final String YELLOW = "\033[0;33m";
    public static final String BLUE = "\033[0;34m";
    public static final String PURPLE = "\033[0;35m";
    public static final String CYAN = "\033[0;36m";
    public static final String WHITE_BOLD = "\033[1;37m";

    static class Movie {
        String title;
        ArrayList<Integer> ratings = new ArrayList<>();
        ArrayList<String> reviews = new ArrayList<>();

        Movie(String title) {
            this.title = title;
        }

        void addReview(String review, int rating) {
            reviews.add(review);
            ratings.add(rating);
        }

        double getAverageRating() {
            if (ratings.isEmpty()) return 0;
            int sum = 0;
            for (int r : ratings) sum += r;
            return (double) sum / ratings.size();
        }

        void displayDetails() {
            System.out.println(PURPLE + "\n🎬 " + title + RESET);
            System.out.printf(YELLOW + "⭐ Average Rating: %.1f / 5\n" + RESET, getAverageRating());
            if (reviews.isEmpty()) {
                System.out.println(CYAN + "No reviews yet. Be the first to review!" + RESET);
            } else {
                System.out.println(CYAN + "User Reviews:" + RESET);
                for (int i = 0; i < reviews.size(); i++) {
                    System.out.println("  - " + reviews.get(i) + " (" + ratings.get(i) + "★)");
                }
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Map<String, Movie> movies = new HashMap<>();

        // Preloaded movies
        movies.put("Interstellar", new Movie("Interstellar"));
        movies.put("Inception", new Movie("Inception"));
        movies.put("Tenet", new Movie("Tenet"));

        System.out.println(BLUE + "===== Movie Review & Rating System =====" + RESET);

        while (true) {
            System.out.println("\n" + WHITE_BOLD + "1. View Movies" + RESET);
            System.out.println(WHITE_BOLD + "2. Add Review" + RESET);
            System.out.println(WHITE_BOLD + "3. Exit" + RESET);
            System.out.print(GREEN + "Choose an option: " + RESET);
            
            int choice = sc.hasNextInt() ? sc.nextInt() : -1;
            sc.nextLine(); // clear buffer

            if (choice == 1) {
                for (Movie m : movies.values()) {
                    m.displayDetails();
                }
            } else if (choice == 2) {
                System.out.println("\nAvailable Movies: " + movies.keySet());
                System.out.print("Enter movie name: ");
                String name = sc.nextLine();
                Movie movie = movies.get(name);
                if (movie == null) {
                    System.out.println(RED + "❌ Movie not found." + RESET);
                    continue;
                }
                System.out.print("Enter your review: ");
                String review = sc.nextLine();
                System.out.print("Enter rating (1–5): ");
                int rating = sc.hasNextInt() ? sc.nextInt() : 0;
                sc.nextLine();
                if (rating < 1 || rating > 5) {
                    System.out.println(RED + "❌ Invalid rating. Must be 1–5." + RESET);
                    continue;
                }
                movie.addReview(review, rating);
                System.out.println(GREEN + "✅ Review added successfully!" + RESET);
            } else if (choice == 3) {
                System.out.println(BLUE + "Thank you for using the Movie Review System!" + RESET);
                break;
            } else {
                System.out.println(RED + "Invalid option. Try again." + RESET);
            }
        }
        sc.close();
    }
}
