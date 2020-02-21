package com.crickettechnology.trees;

import androidx.appcompat.app.*;
import android.os.*;
import android.widget.*;

public class InfoActivity extends AppCompatActivity
{
    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_info);

        Button closeButton = findViewById(R.id.closeButton);
        closeButton.setOnClickListener((view) -> closeButtonPressed());
    }

    private void closeButtonPressed()
    {
        finish();
    }
}

